// Config centralizada de la API.

const PORT = Number(process.env.PORT ?? 8080);

// Por default uso SQLite.
// También se permite "memory".
const PERSISTENCE_TYPE = process.env.PERSISTENCE_TYPE ?? "sequelize";

// Ruta del archivo SQLite.
const SQLITE_STORAGE = process.env.SQLITE_STORAGE ?? "data/cine.sqlite";

// Validar el puerto.
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT debe ser un puerto válido");
}

// Validar la persistencia seleccionada.
if (!["memory", "sequelize"].includes(PERSISTENCE_TYPE)) {
  throw new Error("PERSISTENCE_TYPE debe ser memory o sequelize");
}

// Exportar la configuración.
export { PORT, PERSISTENCE_TYPE, SQLITE_STORAGE };