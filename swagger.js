import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ok-Corral-API",
      version: "1.0.0",
      description: "API for the course ArchiOWeb at HEIG-VD",
    },
    servers: [
      {
        url: "https://comem-archioweb-ok-corral-api.onrender.com/",
      },
    ],
  },
  apis: ["./routes/*.js"], // Chemin vers les fichiers contenant les annotations Swagger
};

const specs = swaggerJsdoc(options);

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(specs));

export default router;
