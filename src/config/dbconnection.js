const mysql = require('mysql');

module.exports = () => {
  return mysql.createConnection({
    host: '160.153.132.207',
    user: 'admincitech',
    password: '12345678',
    database: 'alfred_bd',
    port:3306
  });
}
