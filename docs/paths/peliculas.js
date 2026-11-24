import { operation, ref, arrayOf, json } from "../operation.js";

import {
  idPeliculaSchema,
  crearPeliculaSchema,
  actualizarPeliculaSchema,
} from "../../schemas/peliculaSchemas.js";

const tag = "Películas";

export default {
  "/peliculas": {
    get: operation({
      tag,
      id: "getPeliculas",
      summary: "Listar películas",
      responses: {
        200: json("Películas", arrayOf("Pelicula")),
      },
    }),

    post: operation({
      tag,
      id: "createPelicula",
      summary: "Crear película con cupos disponibles",
      body: crearPeliculaSchema,
      bodyExample: {
        titulo: "Interestelar",
        fechaProyeccion: "2026-12-20T21:00:00-03:00",
        capacidadTotal: 30,
      },
      responses: {
        201: json("Película creada", ref("Pelicula")),
      },
    }),
  },

  "/peliculas/{id}": {
    get: operation({
      tag,
      id: "getPelicula",
      summary: "Consultar película",
      params: idPeliculaSchema,
      responses: {
        200: json("Película", ref("Pelicula")),
      },
      errors: ["PELICULA_NOT_FOUND"],
    }),

    put: operation({
      tag,
      id: "updatePelicula",
      summary: "Actualizar película",
      description:
        "Si cambia la capacidad, se mantienen los lugares ya ocupados.",
      params: idPeliculaSchema,
      body: actualizarPeliculaSchema,
      bodyExample: { capacidadTotal: 40 },
      responses: {
        200: json("Película actualizada", ref("Pelicula")),
      },
      errors: ["PELICULA_NOT_FOUND", "CAPACIDAD_INSUFICIENTE"],
    }),

    delete: operation({
      tag,
      id: "deletePelicula",
      summary: "Eliminar película sin reservas asociadas",
      params: idPeliculaSchema,
      responses: {
        204: { description: "Eliminada, sin cuerpo" },
      },
      errors: ["PELICULA_NOT_FOUND", "PELICULA_CON_RESERVAS"],
    }),
  },
};