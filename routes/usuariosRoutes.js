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
function createUsuariosRoutes(controller, { authenticate, authorize }) {

  const router = Router();
  const adminOnly = [authenticate, authorize("admin")]; //Array de middlewares

  // Listar usuarios. Valida parámetros query.
  router.get(
    "/",
    adminOnly,
    validate(usuarioQuerySchema, "query"),
    controller.list,
  );

  // Consultar usuario por ID.
  router.get(
    "/:id",
    adminOnly,
    validateParams(idUsuarioSchema),
    controller.get,
  );

  // Crear usuario.
  router.post("/", adminOnly, validate(crearUsuarioSchema), controller.create);

  // Actualizar usuario.
  router.put(
    "/:id",
    adminOnly,
    validateParams(idUsuarioSchema),
    validate(actualizarUsuarioSchema),
    controller.update,
  );

  // Eliminar usuario.
  router.delete(
    "/:id",
    adminOnly,
    validateParams(idUsuarioSchema),
    controller.remove,
  );

  return router;
}

export default createUsuariosRoutes;
