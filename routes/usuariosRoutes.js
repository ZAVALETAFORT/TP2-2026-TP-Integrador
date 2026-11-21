//Defino los endpoints y aplica las validaciones de Zod //

import { Router } from "express";

import validate, { validateParams } from "../middlewares/validate.js";

import {
  idUsuarioSchema,
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  usuarioQuerySchema,
} from "../schemas/usuarioSchemas.js";

// Factory de rutas de usuarios.
function createUsuariosRoutes(controller) {
  const router = Router();

  // Listar usuarios. Valida parámetros query.
  router.get("/", validate(usuarioQuerySchema, "query"), controller.list);

  // Consultar usuario por ID.
  router.get("/:id", validateParams(idUsuarioSchema), controller.get);

  // Crear usuario.
  router.post("/", validate(crearUsuarioSchema), controller.create);

  // Actualizar usuario.
  router.put(
    "/:id",
    validateParams(idUsuarioSchema),
    validate(actualizarUsuarioSchema),
    controller.update,
  );

  // Eliminar usuario.
  router.delete("/:id", validateParams(idUsuarioSchema), controller.remove);

  return router;
}

export default createUsuariosRoutes;
