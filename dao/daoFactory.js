import { PERSISTENCE_TYPE } from "../config/config.js";

// DAO de Películas.
import peliculasMemoryDao from "./peliculasMemoryDao.js";
import peliculasSequelizeDao from "./peliculasSequelizeDao.js";

// DAO de Usuarios.
import usuariosMemoryDao from "./usuariosMemoryDao.js";
import usuariosSequelizeDao from "./usuariosSequelizeDao.js";

// Selecciona el DAO de Películas según la configuración.
function getPeliculasDao() {
  if (PERSISTENCE_TYPE === "sequelize") {
    return peliculasSequelizeDao;
  }

  return peliculasMemoryDao;
}

// Selecciona el DAO de Usuarios según la configuración.
function getUsuariosDao() {
  if (PERSISTENCE_TYPE === "sequelize") {
    return usuariosSequelizeDao;
  }

  return usuariosMemoryDao;
}

// Exportaciones que utilizará el Container.
export {
  getPeliculasDao,
  getUsuariosDao
};