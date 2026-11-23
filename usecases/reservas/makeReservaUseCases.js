import getUsuarios from "./getUsuarios.js";
import getUsuarioById from "./getUsuarioById.js";
import createUsuario from "./createUsuario.js";
import updateUsuario from "./updateUsuario.js";
import deleteUsuario from "./deleteUsuario.js";

// Conecta los casos de uso de Usuarios con sus DAO.
function makeUsuarioUseCases(dao, reservasDao) {
  return {
    getUsuarios: () => getUsuarios(dao),
    getUsuarioById: (id) => getUsuarioById(id, dao),
    createUsuario: (data) => createUsuario(data, dao),
    updateUsuario: (id, changes) => updateUsuario(id, changes, dao),

    // Verifica reservas antes de permitir la eliminación.
    deleteUsuario: (id) => deleteUsuario(id, dao, reservasDao),
    
  };
}

export default makeUsuarioUseCases;
