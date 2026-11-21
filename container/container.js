import { Router } from "express";

// Config de persistencia DB
import { PERSISTENCE_TYPE } from "../config/config.js";

// Conexión y modelos Sequelize.
import { sequelize } from "../dao/models/index.js";

// Factory de los DAO.
import { getPeliculasDao, getUsuariosDao } from "../dao/daoFactory.js";

// Factories de casos de uso.
import makePeliculaUseCases from "../usecases/peliculas/makePeliculaUseCases.js";
import makeUsuarioUseCases from "../usecases/usuarios/makeUsuarioUseCases.js";

// Controllers.
import PeliculasController from "../controllers/peliculasController.js";
import UsuariosController from "../controllers/usuariosController.js";

// Routers.
import createPeliculasRoutes from "../routes/peliculasRoutes.js";
import createUsuariosRoutes from "../routes/usuariosRoutes.js";
import healthRoutes from "../routes/healthRoutes.js";

// Composition Root: construye las dependencias de la aplicación.
async function buildContainer() {
  // 1. Inicializar SQLite 
  if (PERSISTENCE_TYPE === "sequelize") {
    await sequelize.sync();

    console.log("[SQLite] Base de datos inicializada");
  }

  // 2. Obtener los DAO desde la Factory.
  const peliculasDao = getPeliculasDao();
  const usuariosDao = getUsuariosDao();

  // 3. Inyectar los DAO en los casos de uso (Factory)
  const peliculasUseCases = makePeliculaUseCases(peliculasDao);
  const usuariosUseCases = makeUsuarioUseCases(usuariosDao);

  // 4. Inyectar los casos de uso en los Controllers.
  const peliculasController = new PeliculasController(peliculasUseCases);
  const usuariosController = new UsuariosController(usuariosUseCases);

  // 5. Construir routers y endpoints.
  const router = Router();

  // Ruta de salud.
  router.use("/health", healthRoutes);

  // Rutas de películas.
  router.use("/peliculas", createPeliculasRoutes(peliculasController));

  // Rutas de usuarios.
  router.use("/usuarios", createUsuariosRoutes(usuariosController));

  // 6. Devolver el Router configurado.
  return router;
}

export default buildContainer;
