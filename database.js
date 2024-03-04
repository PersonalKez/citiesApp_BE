import mysql from "mysql2";

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "dev",
    database: "cities",
  });

export default connection.promise();