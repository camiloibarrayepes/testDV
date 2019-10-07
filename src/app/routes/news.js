const dbConnection = require('../../config/dbconnection');
let fs = require('fs');
const digits_only = string => [...string].every(c => '0123456789'.includes(c));
var newDataArray = []
var count = 0

module.exports = app => {
  
  app.use(require('skipper')());
  const connection = dbConnection();
  
  app.get('/', (req, res) => {
      connection.query("SELECT * FROM companies", (err, resultCompanies) => {
        console.log("resultCompanies", resultCompanies)
        res.render('news/index', {
          companies: resultCompanies
        });
      })
  });

  app.post('/new_file', (req, res) => {
      console.log("id_company", req.body.id_company)
      res.render('news/new_file', {
        title: "New file",
        id_company: req.body.id_company
      });
  });

  app.post('/upload', function (req, res) {

    const { add_kw, add_sp_ch, id_company, checkbox_nombres, checkbox_apellidos, checkbox_telefonos, checkbox_direcciones } = req.body;

    req.file('avatar').upload(function (err, uploadedFiles) {
  
    if (err) return res.send(500, err);
      
      let urlDirUpload = uploadedFiles[0].fd
      
      //TRY TO SAVE IN DB
      try {
        const data = fs.readFileSync(urlDirUpload, 'utf8')

        let init_separators = ["[", "&", "." , "," , "%", "]"]
        
        //add news special charactes if exists
        init_separators.splice(2, 0, add_sp_ch);
        let final_separators = init_separators.join("").toString();
        final_separators = new RegExp(final_separators)
        console.log("final_separators",final_separators)

        final_separators = add_kw == "" ? final_separators : add_kw 
      
        //check if exists keyword
        //final_separators = add_kw != undefined ? add_kw : final_separators
        
        //remove spaces
        let response_data = data.split(/\r?\n/g)
          
        response_data.forEach(element => {  
            console.log("ELEMENT", element)  
            count += 1
            let data = element.split(final_separators)
            console.log("DATA", data)

            if(data.length>4){
              //Remove data like ages or error data
              let filteredArr = data.filter(item => item.trim().toString().length > 4);
              data=filteredArr
            }
            
            /*================ CHECK MULTIPLES PHONES  ===================*/
            
            //Create new array only wit numbers (phones)
            let onlyNumbers = data.filter(item => digits_only(item.trim().toString()) );
            let onlyNumbersLength = onlyNumbers.filter(item => item.trim().toString().length > 4);
            
            //join and remove spaces
            let onlyNumbersLengthJoin = onlyNumbersLength.join('-').replace(/ /g, "")

            //create new array without numbers
            let noNumbers = data.filter(item => !digits_only(item.trim().toString()) );
 
            //insert var of numbers to array in pos [2]
            noNumbers.splice(2, 0, onlyNumbersLengthJoin);

            /*================ CHECK MULTIPLES ADDRESSES  ===================*/

            //New array with addresses
            wordsInAddres = ["edificio", "carrera", "barrio", "comuna", "calle", "cll", "cra", "kra", "avenida"]
            let possibleAddres = noNumbers.filter(item => (wordsInAddres.some(el => item.toString().toLowerCase().includes(el) )));
            
            //join and remove spaces
            let onlyAddressesJoin= possibleAddres.join(' ; ')

            //create new array without directions
            let noAddressesArray = noNumbers.filter(item => (!wordsInAddres.some(el => item.toString().toLowerCase().includes(el))));

            noAddressesArray.splice(3, 0, onlyAddressesJoin)
            newdata = noAddressesArray 

            newDataArray.push({
              id_company: id_company,
              nombres: checkbox_nombres==undefined?"":newdata[0],
              apellidos: checkbox_apellidos==undefined?"":newdata[1],
              telefonos: checkbox_telefonos==undefined?"":newdata[2],
              direcciones: checkbox_direcciones==undefined?"":newdata[3],
              last_update: new Date()
            })
        });
    
          newDataArray.forEach(element => {
          console.log("element",element)
          //insert in the BD iterating the response array
          const { id_company, nombres, apellidos, telefonos, direcciones, last_update } = element;
          connection.query('INSERT INTO campaign SET ? ',
            {
              id_company,
              nombres,
              apellidos,
              telefonos,
              direcciones,
              last_update
            }
          , (err, result) => {
            console.log("ERROR", err)
          });
        });
    
        
        if(count>=response_data.length){
          newDataArray=[]
          count=0
          res.redirect('info/'+id_company);
        }else{ res.send(newDataArray)}
        
    
        } catch (err) {
          res.send(err)
          console.error(err)
        }

    });
  });


  app.get('/info/:id_company', (req, res) => {
    console.log("REQ.BODY", req.params.id_company)
    let id_company = req.params.id_company
    connection.query("SELECT * FROM campaign WHERE id_company='"+id_company+"' ORDER BY id DESC" , (err, resultCampaign) => {
      connection.query("SELECT * FROM companies WHERE id='"+id_company+"' ORDER BY id DESC", (err, resultCompanies) => {
        //console.log("resultCompanies", resultCompanies)
        //console.log("resultCampaign", resultCampaign)
        console.log("resultCampaign",resultCampaign)
        res.render('news/news', {
          news: resultCampaign,
          companies_info: resultCompanies,
          last_update: formatDate(resultCampaign[0].last_update),
          number_registers: resultCampaign.length
        });
      })
    });
  });

  app.post('/news', (req, res) => {
    console.log("req.body", req.body)
    const { nombres, apellidos, telefonos, direcciones } = req.body;
    connection.query('INSERT INTO campaign SET ? ',
      {
        id_company,
        nombres,
        apellidos,
        telefonos,
        direcciones
      }
    , (err, result) => {
      res.redirect('/');
    });
  });
};

//Functions

function formatDate(date) {
  let event = new Date(date);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return event.toLocaleDateString('en-US', options);
}