import { Router } from "express";
import validate from "../middlewares/validate.js";
import { registerSchema } from "../schemas/authSchema.js";

function createAuthRoutes(controller) {
  const router = Router();

  router.post(
    "/register",
    validate(registerSchema),
    controller.register
  );

  return router;
}

export default createAuthRoutes;