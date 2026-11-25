import { jsonSchema } from "./zodToOpenApi.js";
import * as responseSchemas from "./responseSchemas.js";

import healthPaths from "./paths/health.js";
import authPaths from "./paths/auth.js";
import usuariosPaths from "./paths/usuarios.js";
import peliculasPaths from "./paths/peliculas.js";
import reservasPaths from "./paths/reservas.js";

// Creo el objeto OpenAPI a partir de los paths y los schemas
function buildOpenApiSpec({ serverUrl = "/" } = {}) {
  const schemas = Object.fromEntries(
    Object.entries(responseSchemas).map(([name, schema]) => [
      name,
      jsonSchema(schema),
    ]),
  );

  return {
    openapi: "3.1.0",

    info: {
      title: "TP2 - API de Reservas de Cine",
      version: "1.0.0",
      description:
        "API REST de usuarios, películas y reservas con DAO Memory y Sequelize.",
    },

    servers: [
      {
        url: serverUrl,
        description: "Este servidor",
      },
    ],

    tags: [
      { name: "Salud" },
      { name: "Autenticación" },
      {
        name: "Usuarios",
        description: "Operaciones exclusivas de administradores.",
      },
      {
        name: "Películas",
        description:
          "Consultas públicas. Alta, modificación y baja solo para administradores.",
      },
      {
        name: "Reservas",
        description:
          "Requieren JWT. Los clientes operan sus reservas y los administradores pueden operar todas.",
      },
    ],

    paths: {
      ...healthPaths,
      ...authPaths,
      ...usuariosPaths,
      ...peliculasPaths,
      ...reservasPaths,
    },

    // JWT requerido por defecto, excepto en las operaciones públicas.
    security: [{ bearerAuth: [] }],

    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };
}

export default buildOpenApiSpec;