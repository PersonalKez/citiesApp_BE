import mysql from "mysql2";

const connection = mysql.createPool({
    host: "mysql",
    user: "root",
    password: "root",
    database: "cities",
    timezone: "+00:00"
  });

export default connection.promise();