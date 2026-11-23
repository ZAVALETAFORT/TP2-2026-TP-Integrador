import getUsuarios from "./getUsuarios.js";
import getUsuarioById from "./getUsuarioById.js";
import createUsuario from "./createUsuario.js";
import updateUsuario from "./updateUsuario.js";
import deleteUsuario from "./deleteUsuario.js";
//Vinculacion de los useCases con los DAO
// Factory: inyecta el DAO en los casos de uso.
function makeUsuarioUseCases(dao) {
  return {
    getUsuarios: () => getUsuarios(dao),

    getUsuarioById: (id) => getUsuarioById(id, dao),

    createUsuario: (data) => createUsuario(data, dao),

    updateUsuario: (id, changes) => updateUsuario(id, changes, dao),

    deleteUsuario: (id) => deleteUsuario(id, dao),
  };
}

export default makeUsuarioUseCases;
