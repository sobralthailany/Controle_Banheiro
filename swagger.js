const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - Fila do Banheiro",
      version: "1.0.0",
      description: "Documentação da API do sistema de controle de fila do banheiro"
    },
    servers: [
      {
        url: "http://localhost:3005",
        description: "Servidor local"
      }
    ]
  },
  apis: ["./routes/*.js"], // buscará comentários de documentação nas rotas
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;