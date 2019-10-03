const dbConnection = require('../../config/dbconnection');
var fs = require('fs');


module.exports = app => {
  
  app.use(require('skipper')());
  const connection = dbConnection();
  var newDataArray = []
  var count = 0


  app.get('/new_file', (req, res) => {
      res.render('news/new_file', {
        title: "New file"
      });
  });

  app.post('/upload', function (req, res) {


    const { checkbox_nombres, checkbox_apellidos, checkbox_telefonos, checkbox_direcciones } = req.body;

    req.file('avatar').upload(function (err, uploadedFiles) {
  
    if (err) return res.send(500, err);
      /*var respUpload = res.json({
        message: uploadedFiles.length + ' file(s) uploaded successfully!',
        files: uploadedFiles
      });*/
      
      var urlDirUpload = uploadedFiles[0].fd
      console.log("urlDirUpload", urlDirUpload)

      //TRY TO SAVE IN DB
      try {
        const data = fs.readFileSync(urlDirUpload, 'utf8')
          
        //Quitar espacios
        let respuesta = data.split(/\r?\n/g)
          
        respuesta.forEach(element => {

            
            count += 1
            // split one more time
            const data = element.split(/[.,%]/)

            
            //Eliminamos datos como Edad, o erroneos
            for(var i=0; i<data.length; i++){
              if(data[i].trim().length<3){
                //posiblemente edad o dato no relevante
                console.log("ENTRA AQUI", data[i].trim())
                data.splice(i,1); 
              }
            }


            newDataArray.push({
              nombres: checkbox_nombres.length==1?"":data[0],
              apellidos: checkbox_apellidos.length==1?"":data[1],
              telefonos: checkbox_telefonos.length==1?"":data[2],
              direcciones: checkbox_direcciones.length==1?"":data[3]
            })
        });
    
          //console.log("newDataArray", newDataArray.length)
          newDataArray.forEach(element => {
    
          //se inserta en la base de datos iterando sobre el array de la respuesta
          const { nombres, apellidos, telefonos, direcciones } = element;
          connection.query('INSERT INTO campaign SET ? ',
            {
              nombres,
              apellidos,
              telefonos,
              direcciones
            }
          , (err, result) => {
            //res.redirect('/');
          });
          
        });
    
        if(count>=respuesta.length){
          res.redirect('/');
        }else{
          res.send(newDataArray)
        }
        
    
        } catch (err) {
          res.send(err)
          console.error(err)
        }

    });
  });


  app.get('/prueba', (req, res) => {
    try {
    const data = fs.readFileSync('/Users/camiloandresibarrayepes/Documents/YEPETO/PersonalProjects/Pruebas/DavinciTest/src/prueba/prueba.txt', 'utf8')
      
    //Quitar espacios
    let respuesta = data.split(/\r?\n/g)
      
    respuesta.forEach(element => {
        // split one more time
        const data = element.split(/[.,%]/)
        newDataArray.push({
          nombres: data[0],
          apellidos: data[1],
          telefonos: data[2],
          direcciones: data[3]
        })
    });

      //console.log("newDataArray", newDataArray.length)
      newDataArray.forEach(element => {

      //se inserta en la base de datos iterando sobre el array de la respuesta
      const { nombres, apellidos, telefonos, direcciones } = element;
      connection.query('INSERT INTO campaign SET ? ',
        {
          nombres,
          apellidos,
          telefonos,
          direcciones
        }
      , (err, result) => {
        //res.redirect('/');
      });
      
    });

    res.send(newDataArray)

    } catch (err) {
      res.send(err)
      console.error(err)
    }
  });

  app.get('/', (req, res) => {
    connection.query('SELECT * FROM campaign', (err, result) => {
      res.render('news/news', {
        news: result
      });
    });
  });

  app.post('/news', (req, res) => {
    console.log("req.body", req.body)
    const { nombres, apellidos, telefonos, direcciones } = req.body;
    connection.query('INSERT INTO campaign SET ? ',
      {
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