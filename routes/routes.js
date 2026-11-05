import { Router } from "express";
import healthRoutes from "./healthRoutes.js";

// Router principal: agrupa los routers de cada recurso.
const routes = Router();

// Asignamos el prefijo /health al router correspondiente.
routes.use("/health", healthRoutes);

export default routes;