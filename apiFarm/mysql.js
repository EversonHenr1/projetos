const mysql = require("mysql2")

const pool = mysql.createPool({
    "user":"root",
    "password":"",
    "database":"farm",
    "host":"localhost",
    "port":3306
});

exports.pool = pool