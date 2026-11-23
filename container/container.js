import { Router } from "express";

import { PERSISTENCE_TYPE } from "../config/config.js";
import { sequelize } from "../dao/models/index.js";

import {
  getPeliculasDao,
  getUsuariosDao,
  getReservasDao,
} from "../dao/daoFactory.js";

import makePeliculaUseCases from "../usecases/peliculas/makePeliculaUseCases.js";
import makeUsuarioUseCases from "../usecases/usuarios/makeUsuarioUseCases.js";
import makeReservaUseCases from "../usecases/reservas/makeReservaUseCases.js";

import PeliculasController from "../controllers/peliculasController.js";
import UsuariosController from "../controllers/usuariosController.js";
import ReservasController from "../controllers/reservasController.js";

import createPeliculasRoutes from "../routes/peliculasRoutes.js";
import createUsuariosRoutes from "../routes/usuariosRoutes.js";
import createReservasRoutes from "../routes/reservasRoutes.js";
import healthRoutes from "../routes/healthRoutes.js";

// Construye las dependencias y devuelve el Router principal.
async function buildContainer() {
  // Inicializa automáticamente las tablas cuando usamos SQLite.
  if (PERSISTENCE_TYPE === "sequelize") {
    await sequelize.sync();
    console.log("[SQLite] Base de datos inicializada");
  }

  const peliculasDao = getPeliculasDao();
  const usuariosDao = getUsuariosDao();
  const reservasDao = getReservasDao();

  // Construye los casos de uso inyectando los DAO que necesitan.
  const peliculasUseCases = makePeliculaUseCases(peliculasDao, reservasDao);
  const usuariosUseCases = makeUsuarioUseCases(usuariosDao, reservasDao);
  //Aca le paso los 3 DAOs OBJETO a los makers
  const reservasUseCases = makeReservaUseCases({reservasDao,peliculasDao,usuariosDao});

  // Instancio los Controllers con los casos de uso que necesitan.
  const peliculasController = new PeliculasController(peliculasUseCases);
  const usuariosController = new UsuariosController(usuariosUseCases);
  const reservasController = new ReservasController(reservasUseCases);

  // Conecta los Controllers con sus endpoints.
  const router = Router();

  router.use("/health", healthRoutes);
  router.use("/peliculas", createPeliculasRoutes(peliculasController));
  router.use("/usuarios", createUsuariosRoutes(usuariosController));
  router.use("/reservas", createReservasRoutes(reservasController));

  return router;
}

export default buildContainer;