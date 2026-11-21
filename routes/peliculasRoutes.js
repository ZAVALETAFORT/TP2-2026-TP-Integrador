import { Router } from "express";

import validate, { validateParams } from "../middlewares/validate.js";

import {
  idPeliculaSchema,
  crearPeliculaSchema,
  actualizarPeliculaSchema,
} from "../schemas/peliculaSchemas.js";

// Factory de rutas de películas.
// Recibe el Controller desde el Container.
function createPeliculasRoutes(controller) {
  // Creamos un Router de Express.
  const router = Router();

  // GET /peliculas
  // Devuelve todas las películas.
  router.get("/", controller.list);

  // GET /peliculas/:id
  // Busca una película por su ID.
  router.get("/:id", validateParams(idPeliculaSchema), controller.get);

  // POST /peliculas
  // Crea una película validando el JSON.
  router.post("/", validate(crearPeliculaSchema), controller.create);

  // PUT /peliculas/:id
  // Actualiza una película.
  router.put(
    "/:id",
    validateParams(idPeliculaSchema),
    validate(actualizarPeliculaSchema),
    controller.update,
  );

  // DELETE /peliculas/:id
  // Elimina una película.
  router.delete("/:id", validateParams(idPeliculaSchema), controller.remove);

  // Entregamos el Router configurado.
  return router;
}

export default createPeliculasRoutes;
