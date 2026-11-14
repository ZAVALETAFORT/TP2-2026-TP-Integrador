import express from "express";
import peliculasController from "../controllers/peliculasController.js"; 
import validate, {validateParams} from "../middlewares/validate.js"; 
import {idPeliculaSchema, crearPeliculaSchema, actualizarPeliculaSchema} from "../schemas/peliculaSchemas.js"; //schema Zod

const peliculasRoutes = express.Router();

// GET: consulta todas las peliculas
peliculasRoutes.get("/", peliculasController.list);

// POST: Crea una nueva pelicula, validando el body con Zod
peliculasRoutes.post( "/", validate(crearPeliculaSchema), peliculasController.create );

//GET: /peliculas/:id - Consulta una pelicula por ID, validando el parametro con Zod
peliculasRoutes.get("/:id", validateParams(idPeliculaSchema), peliculasController.get);

//PUT: /peliculas/:id - Actualiza una pelicula por ID, validando el parametro y el body con Zod
peliculasRoutes.put("/:id", validateParams(idPeliculaSchema), validate(actualizarPeliculaSchema), peliculasController.update);

//DELETE: /peliculas/:id - Elimina una pelicula por ID, validando el parametro con Zod
peliculasRoutes.delete("/:id", validateParams(idPeliculaSchema), peliculasController.remove);



export default peliculasRoutes;

//CONTINUAR EN 7.2 AGREGAR LAS RUTAS