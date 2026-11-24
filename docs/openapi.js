import { jsonSchema } from "./zodToOpenApi.js";
import * as responseSchemas from "./responseSchemas.js";

import healthPaths from "./paths/health.js";
import usuariosPaths from "./paths/usuarios.js";
import peliculasPaths from "./paths/peliculas.js";
import reservasPaths from "./paths/reservas.js";

// Creo el objeto OpenAPI a partir de los paths y los schemas
function buildOpenApiSpec({ serverUrl = "/" } = {}) {
  const schemas = Object.fromEntries(
    Object.entries(responseSchemas).map(
      ([name, schema]) => [name, jsonSchema(schema)]
    )
  );

  return {
    openapi: "3.1.0",

    info: {
      title: "TP2 - API de Reservas de Cine",
      version: "1.0.0",
      description: "API REST de usuarios, películas y reservas con DAO Memory y Sequelize."
    },

    servers: [{
      url: serverUrl,
      description: "Este servidor"
    }],

    tags: [
      { name: "Salud" },
      { name: "Usuarios" },
      { name: "Películas" },
      { name: "Reservas" }
    ],

    paths: {
      ...healthPaths,
      ...usuariosPaths,
      ...peliculasPaths,
      ...reservasPaths
    },

    components: {
      schemas
    }
  };
}

export default buildOpenApiSpec;