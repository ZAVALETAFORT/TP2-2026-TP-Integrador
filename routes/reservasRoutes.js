import { Router } from "express";

import validate, { validateParams } from "../middlewares/validate.js";

import {
  idReservaSchema,
  crearReservaSchema,
  actualizarReservaSchema,
  reservaQuerySchema,
} from "../schemas/reservaSchemas.js";

// Relaciona cada endpoint con su validación y función del Controller.
function createReservasRoutes(controller) {
  const router = Router();

  router.get("/", validate(reservaQuerySchema, "query"), controller.list);

  router.get("/:id", validateParams(idReservaSchema), controller.get);

  router.post("/", validate(crearReservaSchema), controller.create);

  router.put(
    "/:id",
    validateParams(idReservaSchema),
    validate(actualizarReservaSchema),
    controller.update,
  );

  router.delete("/:id", validateParams(idReservaSchema), controller.remove);

  return router;
}

export default createReservasRoutes;