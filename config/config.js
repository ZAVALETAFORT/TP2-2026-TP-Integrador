// Config centralizada de la API.

//Puerto por defecto y validación.
const PORT = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT debe ser un puerto válido");
}

//Entorno por defecto
const NODE_ENV = process.env.NODE_ENV ?? "development";

// Persistencia y validación(Por default SQLite con Sequelize)
const PERSISTENCE_TYPE = process.env.PERSISTENCE_TYPE ?? "sequelize";
if (!["memory", "sequelize"].includes(PERSISTENCE_TYPE)) {
  throw new Error("PERSISTENCE_TYPE debe ser memory o sequelize");
}

// Ruta del archivo SQLite.
const SQLITE_STORAGE = process.env.SQLITE_STORAGE ?? "data/cine.sqlite";

// Apaga-prende swagger y OpenAPI
const DOCS_ENABLED =
  (process.env.DOCS_ENABLED ??
    (NODE_ENV === "production" ? "false" : "true")) === "true";

//Precarga con mock de datos
const MOCK_ENABLED =
  (process.env.MOCK_ENABLED ??
    (NODE_ENV === "production" ? "false" : "true")) === "true";

// Costo del hash bcrypt
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 5;

//Uso de JWT
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { 
  throw new Error("JWT_SECRET es requerido");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; //expiracion JWT

//Creacion de admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export {
  PORT,
  NODE_ENV,
  PERSISTENCE_TYPE,
  SQLITE_STORAGE,
  DOCS_ENABLED,
  MOCK_ENABLED,
  BCRYPT_ROUNDS,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ADMIN_EMAIL,
  ADMIN_PASSWORD
};