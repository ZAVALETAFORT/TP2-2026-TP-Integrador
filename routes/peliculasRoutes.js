import { Router } from "express";

import validate, { validateParams } from "../middlewares/validate.js";

import {
  idPeliculaSchema,
  crearPeliculaSchema,
  actualizarPeliculaSchema,
} from "../schemas/peliculaSchemas.js";

// Factory de rutas de películas.
// Recibe el Controller desde el Container.
function createPeliculasRoutes(controller, { authenticate, authorize }) {
  // Creamos un Router de Express.
  const router = Router();

  // GET /peliculas
  // Devuelve todas las películas.
  router.get("/", controller.list);

  // GET /peliculas/:id
  // Busca una película por su ID.
  router.get("/:id", validateParams(idPeliculaSchema), controller.get);

  // POST /peliculas (SOLO PARA ADMINS)
  // Crea una película validando el schema.
  router.post(
    "/",
    authenticate,
    authorize("admin"),
    validate(crearPeliculaSchema),
    controller.create,
  );

  // PUT /peliculas/:id (SOLO PARA ADMINS)
  // Actualiza una película validando el schema.
  router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validateParams(idPeliculaSchema),
    validate(actualizarPeliculaSchema),
    controller.update,
  );

  // DELETE /peliculas/:id (SOLO PARA ADMINS)
  // Elimina una película validando el schema.
  router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    validateParams(idPeliculaSchema),
    controller.remove,
  );

  // Entregamos el Router configurado.
  return router;
}

export default createPeliculasRoutes;
