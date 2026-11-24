import { Router } from "express";

import { PERSISTENCE_TYPE, DOCS_ENABLED } from "../config/config.js";
import { sequelize } from "../dao/models/index.js";

import {
  getPeliculasDao,
  getUsuariosDao,
  getReservasDao,
} from "../dao/daoFactory.js";

import seedMockData from "../data/mock.js";

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

// Componentes del sistema de eventos.
import createEventBus from "../events/eventBus.js";
import consoleNotifier from "../notifications/consoleNotifier.js";
import registerAlertListeners from "../alerts/registerAlertListeners.js";

//Swagger y OpenAPI
import buildOpenApiSpec from "../docs/openapi.js";
import createDocsRoutes from "../routes/docsRoutes.js";

// Construye las dependencias y devuelve el Router principal.
async function buildContainer() {
  // Inicializa SQLite si corresponde.
  if (PERSISTENCE_TYPE === "sequelize") {
    await sequelize.sync();
    console.log("[SQLite] Base de datos inicializada");
  }

  // Selecciona los DAO según la persistencia configurada.
  const peliculasDao = getPeliculasDao();
  const usuariosDao = getUsuariosDao();
  const reservasDao = getReservasDao();

  // Crea el bus de eventos y registra su listener.
  const events = createEventBus();
  registerAlertListeners(events, consoleNotifier);

  // Construye los casos de uso e inyecta sus dependencias.
  const peliculasUseCases = makePeliculaUseCases(peliculasDao, reservasDao);
  const usuariosUseCases = makeUsuarioUseCases(usuariosDao, reservasDao);
  const reservasUseCases = makeReservaUseCases({
    reservasDao,
    peliculasDao,
    usuariosDao,
    events,
  });

  //Mock de precarga
  if (MOCK_ENABLED) {
    await seedMockData({
      usuariosUseCases,
      peliculasUseCases,
      reservasUseCases,
    });
  }

  // Construye los Controllers con los casos de uso.
  const peliculasController = new PeliculasController(peliculasUseCases);
  const usuariosController = new UsuariosController(usuariosUseCases);
  const reservasController = new ReservasController(reservasUseCases);

  // Registra los endpoints existentes.
  const router = Router();

  router.use("/health", healthRoutes);
  router.use("/peliculas", createPeliculasRoutes(peliculasController));
  router.use("/usuarios", createUsuariosRoutes(usuariosController));
  router.use("/reservas", createReservasRoutes(reservasController));

  // Publica Swagger y OpenAPI cuando la docu está habilitada.
  if (DOCS_ENABLED) {
    router.use(createDocsRoutes(buildOpenApiSpec()));
  }

  return router;
}

export default buildContainer;
