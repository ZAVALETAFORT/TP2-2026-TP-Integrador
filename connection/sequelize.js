import { Sequelize } from "sequelize";
import { SQLITE_STORAGE } from "../config/config.js";

// Config de la conexión con SQLite.
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: SQLITE_STORAGE,
  logging: false
});

export { sequelize };