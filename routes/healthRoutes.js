import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";

// Creamos un Router independiente para health.
const healthRoutes = Router();

// Cuando llegue un GET a "/", ejecutamos el Controller.
// No ponemos paréntesis en getHealth: Express lo ejecutará.
healthRoutes.get("/", getHealth);

export default healthRoutes;