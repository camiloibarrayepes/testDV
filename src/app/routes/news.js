const dbConnection = require('../../config/dbconnection');
var fs = require('fs');

module.exports = app => {

  const connection = dbConnection();
  var newDataArray = []

  app.get('/prueba', (req, res) => {
    try {
    const data = fs.readFileSync('/Users/camiloandresibarrayepes/Documents/YEPETO/PersonalProjects/Pruebas/DavinciTest/src/prueba/prueba.txt', 'utf8')
    //res.send(data)
      
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