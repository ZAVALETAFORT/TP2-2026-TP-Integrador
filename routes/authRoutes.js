import { Router } from "express";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";

function createAuthRoutes(controller) {
  const router = Router();

  // POST: /auth/register Crea un usuario
  router.post("/register", validate(registerSchema), controller.register);

  // POST: /auth/login Login de usuario
  router.post("/login", validate(loginSchema), controller.login);

  return router;
}

export default createAuthRoutes;
