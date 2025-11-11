const mysql = require("mysql2/promise")

//Criando o pool de banco de dados com as config locais
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "controle_banheiro",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;