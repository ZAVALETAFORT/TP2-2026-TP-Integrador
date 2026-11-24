import { operation, ref, arrayOf, json } from "../operation.js";

import {
  idUsuarioSchema,
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  usuarioQuerySchema,
} from "../../schemas/usuarioSchemas.js";

const tag = "Usuarios";

export default {
  "/usuarios": {
    get: operation({
      tag,
      id: "getUsuarios",
      summary: "Listar usuarios",
      description: "El listado actual no admite filtros.",
      query: usuarioQuerySchema,
      responses: {
        200: json("Usuarios", arrayOf("Usuario")),
      },
    }),

    post: operation({
      tag,
      id: "createUsuario",
      summary: "Crear usuario cliente",
      body: crearUsuarioSchema,
      bodyExample: {
        nombre: "Ana Garcia",
        email: "ana@example.com",
      },
      responses: {
        201: json("Usuario creado", ref("Usuario")),
      },
      errors: ["EMAIL_DUPLICATED"],
    }),
  },

  "/usuarios/{id}": {
    get: operation({
      tag,
      id: "getUsuario",
      summary: "Consultar usuario",
      params: idUsuarioSchema,
      responses: {
        200: json("Usuario", ref("Usuario")),
      },
      errors: ["USUARIO_NOT_FOUND"],
    }),

    put: operation({
      tag,
      id: "updateUsuario",
      summary: "Actualizar usuario",
      params: idUsuarioSchema,
      body: actualizarUsuarioSchema,
      bodyExample: { nombre: "Ana Lopez" },
      responses: {
        200: json("Usuario actualizado", ref("Usuario")),
      },
      errors: ["USUARIO_NOT_FOUND", "EMAIL_DUPLICATED"],
    }),

    delete: operation({
      tag,
      id: "deleteUsuario",
      summary: "Eliminar usuario sin reservas asociadas",
      params: idUsuarioSchema,
      responses: {
        204: { description: "Eliminado, sin cuerpo" },
      },
      errors: ["USUARIO_NOT_FOUND", "USUARIO_CON_RESERVAS"],
    }),
  },
};