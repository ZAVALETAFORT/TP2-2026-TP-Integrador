import { z } from "zod";
import { crearUsuarioSchema } from "./usuarioSchemas.js";

// Validación para el registro público.
const registerSchema = crearUsuarioSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
});

export { registerSchema };