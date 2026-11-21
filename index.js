import express from "express";
import { PORT } from "./config/config.js";
import buildContainer from "./container/container.js";

// Middlewares
import logger from "./middlewares/logger.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

async function startServer() {
  const app = express();

  app.use(logger);
  app.use(express.json());

  //Inicio del Container
  const router = await buildContainer();

  app.use(router);
  app.use(notFound);
  app.use(errorHandler); //Errores

  // 7. Iniciar el servidor HTTP.
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Error al iniciar la API:", error);
  process.exitCode = 1;
});
