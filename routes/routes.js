import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import peliculasRoutes from "./peliculasRoutes.js";

// Router principal
const routes = Router();

// Ruteo de /health
routes.use("/health", healthRoutes);

// Ruteo de /peliculas
routes.use("/peliculas", peliculasRoutes); 

export default routes;