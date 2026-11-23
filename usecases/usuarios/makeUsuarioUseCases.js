import getUsuarios from "./getUsuarios.js";
import getUsuarioById from "./getUsuarioById.js";
import createUsuario from "./createUsuario.js";
import updateUsuario from "./updateUsuario.js";
import deleteUsuario from "./deleteUsuario.js";

// Conecta los casos de uso de Usuarios con sus DAO.
function makeUsuarioUseCases(dao, reservasDao) {
  return {
    // Lista todos los usuarios.
    getUsuarios: () => getUsuarios(dao),

    // Consulta un usuario mediante su ID.
    getUsuarioById: (id) => getUsuarioById(id, dao),

    // Crea un usuario.
    createUsuario: (data) => createUsuario(data, dao),

    // Actualiza los datos de un usuario.
    updateUsuario: (id, changes) => updateUsuario(id, changes, dao),

    // Comprueba las reservas antes de eliminar un usuario.
    deleteUsuario: (id) => deleteUsuario(id, dao, reservasDao),
  };
}

export default makeUsuarioUseCases;