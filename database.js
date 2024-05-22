import mysql from "mysql2";

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "dev",
    database: "cities",
    timezone: "+00:00"
  });

export default connection.promise();