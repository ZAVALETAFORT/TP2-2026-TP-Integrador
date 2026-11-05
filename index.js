import express from "express";

// Importo las rutas y los middlewars 
import routes from "./routes/routes.js";
import logger from "./middlewares/logger.js";
import notFound from "./middlewares/notFound.js";

const app = express();
app.use(express.json());

// Middlewares
app.use(logger); // Middleware de logging
app.use(routes); // Rutas de la API
app.use(notFound); // Middleware para manejar rutas no encontradas


app.listen(8080, () => {
  console.log("Puerto 8080");
});

//me quede en fase1 - parte 2: Continuar de aca Cr