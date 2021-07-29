
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  supportBigNumbers: true,
  host: process.env.DB_AREAS_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_CONN_AREAS
})



function query(sql, args) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        return reject(err);
      }
      connection.query(sql, args, function (err, result) {
        connection.release();
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  });
}

module.exports = query;
