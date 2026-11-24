// Config centralizada de la API.

//Puerto por defecto 
const PORT = Number(process.env.PORT ?? 8080);

//Entorno por defecto 
const NODE_ENV = process.env.NODE_ENV ?? "development";

// Por default uso SQLite.
// También se permite "memory".
const PERSISTENCE_TYPE = process.env.PERSISTENCE_TYPE ?? "sequelize";

// Ruta del archivo SQLite.
const SQLITE_STORAGE = process.env.SQLITE_STORAGE ?? "data/cine.sqlite";

// Apaga-prende swagger y OpenAPI
const DOCS_ENABLED = (process.env.DOCS_ENABLED ?? (NODE_ENV === "production" ? "false" : "true")) === "true";

// Validar el puerto.
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT debe ser un puerto válido");
}

// Validar la persistencia seleccionada.
if (!["memory", "sequelize"].includes(PERSISTENCE_TYPE)) {
  throw new Error("PERSISTENCE_TYPE debe ser memory o sequelize");
}

// Exportar la configuración.
export { PORT, NODE_ENV, PERSISTENCE_TYPE, SQLITE_STORAGE, DOCS_ENABLED };