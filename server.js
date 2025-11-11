const express = require("express");
const cors = require("cors");
const path = require("path");
//importar o swagger
const swaggerDocs = require("./swagger"); // IMPORTANTE

const usuariosRoutes = require("./routes/usuariosRoutes");

const app = express();
app.use(cors());
app.use(express.json());

//Rotas
app.use("/usuarios", usuariosRoutes);

//Frontend (/public)
app.use(express.static(path.join(__dirname, "public")))

// Gerar IU Swagger
swaggerDocs(app); // SWAGGER UI

//abre o servidor
const PORT = 3005
app.listen(PORT, () => { 
  console.log(`Servidor rodando em http://localhost:${PORT}`);   
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`); // URL SWAGGER
});