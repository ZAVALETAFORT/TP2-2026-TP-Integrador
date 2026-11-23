import { PERSISTENCE_TYPE } from "../config/config.js";

// DAO de Películas.
import peliculasMemoryDao from "./peliculasMemoryDao.js";
import peliculasSequelizeDao from "./peliculasSequelizeDao.js";

// DAO de Usuarios.
import usuariosMemoryDao from "./usuariosMemoryDao.js";
import usuariosSequelizeDao from "./usuariosSequelizeDao.js";

// DAO de Reservas.
import reservasMemoryDao from "./reservasMemoryDao.js";
import reservasSequelizeDao from "./reservasSequelizeDao.js";

// Selecciona la persistencia de Películas.
function getPeliculasDao() {
  if (PERSISTENCE_TYPE === "sequelize") {
    return peliculasSequelizeDao;
  }

  return peliculasMemoryDao;
}

// Selecciona la persistencia de Usuarios.
function getUsuariosDao() {
  if (PERSISTENCE_TYPE === "sequelize") {
    return usuariosSequelizeDao;
  }

  return usuariosMemoryDao;
}

// Selecciona la persistencia de Reservas.
function getReservasDao() {
  if (PERSISTENCE_TYPE === "sequelize") {
    return reservasSequelizeDao;
  }

  return reservasMemoryDao;
}

export { getPeliculasDao, getUsuariosDao, getReservasDao };