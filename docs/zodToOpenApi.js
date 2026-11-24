import { z } from "zod";

// Reutiliza Zod para generar los esquemas de OpenAPI
function jsonSchema(schema, { io = "output" } = {}) {
  const { $schema, ...result } = z.toJSONSchema(schema, {
    io,
    unrepresentable: "any",
  });

  return result;
}

// Construye el requestBody a partir del schema que valida la ruta.
function body(schema, { example } = {}) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: jsonSchema(schema, { io: "input" }),
        ...(example && { example }),
      },
    },
  };
}

// Convierte los campos Zod en parámetros de path o query.
function params(schema, location) {

  const { properties = {}, required = [] } = jsonSchema(schema);

  return Object.entries(properties).map(([name, propSchema]) => ({
    name,
    in: location,
    required: location === "path" || required.includes(name),
    schema: propSchema,
  }));
}

const path = (schema) => params(schema, "path");
const query = (schema) => params(schema, "query");

export { jsonSchema, body, path, query };
