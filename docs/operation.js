import { body, path, query } from "./zodToOpenApi.js";
import { ERROR_CATALOG, errorExample } from "./errorCatalog.js";

// Reutiliza schemas declarados en components/schemas.
const ref = (name) => ({
  $ref: `#/components/schemas/${name}`,
});

const arrayOf = (name) => ({
  type: "array",
  items: ref(name),
});

const json = (description, schema) => ({
  description,
  content: {
    "application/json": { schema },
  },
});

// Agrupa códigos de error por HTTP status y agrega ejemplos.
function errorResponses(codes) {
  const statuses = {};

  for (const code of new Set(codes)) {
    const entry = ERROR_CATALOG[code];

    if (!entry) {
      throw new Error(`Error no documentado: ${code}`);
    }

    (statuses[entry[0]] ??= []).push(code);
  }

  return Object.fromEntries(
    Object.entries(statuses).map(([status, names]) => [
      status,
      {
        description: `Errores: ${names.join(", ")}`,
        content: {
          "application/json": {
            schema: ref("ErrorResponse"),
            examples: Object.fromEntries(
              names.map((code) => [
                code,
                {
                  summary: code,
                  value: errorExample(code),
                },
              ]),
            ),
          },
        },
      },
    ]),
  );
}

// Construye una operación OpenAPI reutilizando los helpers.
function operation({
  tag,
  id,
  summary,
  description,
  params,
  query: querySchema,
  body: bodySchema,
  bodyExample,
  responses,
  errors = [],
}) {
  const codes = [...errors, "INTERNAL_ERROR"];

  if (params || querySchema || bodySchema) {
    codes.push("VALIDACION_ERROR");
  }

  if (bodySchema) {
    codes.push("INVALID_JSON");
  }

  const parameters = [
    ...(params ? path(params) : []),
    ...(querySchema ? query(querySchema) : []),
  ];

  return {
    tags: [tag],
    operationId: id,
    summary,

    ...(description && { description }),
    ...(parameters.length > 0 && { parameters }),
    ...(bodySchema && {
      requestBody: body(bodySchema, { example: bodyExample }),
    }),

    responses: {
      ...responses,
      ...errorResponses(codes),
    },
  };
}

export { operation, ref, arrayOf, json };
