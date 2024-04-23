const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'lahiru',
    database: 'node-store',
    password: '*'
});

module.exports = pool.promise();