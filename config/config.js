// Configuración centralizada de la API.
const PORT = Number(process.env.PORT ?? 8080);
const PERSISTENCE_TYPE = process.env.PERSISTENCE_TYPE ?? "memory";
const SQLITE_STORAGE = process.env.SQLITE_STORAGE ?? "data/cine.sqlite";

// Validamos el puerto
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT debe ser un puerto válido");
}

// Solo admitimos los dos DAO (RAM y SQLite) 
if (!["memory", "sequelize"].includes(PERSISTENCE_TYPE)) {
  throw new Error("PERSISTENCE_TYPE debe ser memory o sequelize");
}

export { PORT, PERSISTENCE_TYPE, SQLITE_STORAGE };
