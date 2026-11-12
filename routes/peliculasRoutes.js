import express from "express";
import peliculasController from "../controllers/peliculasController.js"; 
import validate from "../middlewares/validate.js"; 
import { crearPeliculaSchema } from "../schemas/peliculaSchemas.js"; //schema Zod

const peliculasRoutes = express.Router();

// GET: consulta todas las peliculas
peliculasRoutes.get("/", peliculasController.list);

// POST: Crea una nueva pelicula, validando el body con Zod
peliculasRoutes.post( "/", validate(crearPeliculaSchema), peliculasController.create );

export default peliculasRoutes;