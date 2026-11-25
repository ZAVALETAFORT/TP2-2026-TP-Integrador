import { operation, ref, json } from "../operation.js";

import { registerSchema, loginSchema } from "../../schemas/authSchema.js";

const tag = "Autenticación";

export default {
  "/auth/register": {
    post: operation({
      tag,
      id: "register",
      summary: "Registrar cliente",
      authRequired: false,
      body: registerSchema,
      bodyExample: {
        nombre: "Cliente Demo",
        email: "cliente@example.com",
        password: "cliente123",
      },
      responses: {
        201: json("Usuario registrado", ref("Usuario")),
      },
      errors: ["EMAIL_DUPLICATED"],
    }),
  },

  "/auth/login": {
    post: operation({
      tag,
      id: "login",
      summary: "Iniciar sesión y obtener JWT",
      authRequired: false,
      body: loginSchema,
      bodyExample: {
        email: "admin@ort.com",
        password: "admin123",
      },
      responses: {
        200: json("Token JWT y usuario autenticado", ref("LoginResponse")),
      },
      errors: ["INVALID_CREDENTIALS"],
    }),
  },
};