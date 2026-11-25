import { Router } from "express";

import validate, { validateParams } from "../middlewares/validate.js";

import {
  idReservaSchema,
  crearReservaSchema,
  actualizarReservaSchema,
  reservaQuerySchema,
} from "../schemas/reservaSchemas.js";

// Relaciona cada endpoint con su validación y función del Controller.
function createReservasRoutes(controller, { authenticate }) {
  const router = Router();

  router.get("/", authenticate, validate(reservaQuerySchema, "query"), controller.list);

  router.get("/:id", authenticate, validateParams(idReservaSchema), controller.get);

  router.post("/", authenticate, validate(crearReservaSchema), controller.create);

  router.put(
    "/:id",
    authenticate,
    validateParams(idReservaSchema),
    validate(actualizarReservaSchema),
    controller.update,
  );

  router.delete("/:id", authenticate, validateParams(idReservaSchema), controller.remove);

  return router;
}

export default createReservasRoutes;
