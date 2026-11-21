import { Sequelize } from "sequelize";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import {
  PERSISTENCE_TYPE,
  SQLITE_STORAGE
} from "../config/config.js";

// Creo la carpeta para SQLite 
if (
  PERSISTENCE_TYPE === "sequelize" &&
  SQLITE_STORAGE !== ":memory:"
) {
  mkdirSync(dirname(SQLITE_STORAGE), {
    recursive: true
  });
}

// Instancia compartida de Sequelize.
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: SQLITE_STORAGE,
  logging: false
});

export { sequelize };