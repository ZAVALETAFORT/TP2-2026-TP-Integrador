import getReservas from "./getReservas.js";
import getReservaById from "./getReservaById.js";
import createReserva from "./createReserva.js";
import updateReserva from "./updateReserva.js";
import deleteReserva from "./deleteReserva.js";

// Conecta los DAO con los casos de uso de Reservas.
function makeReservaUseCases({ reservasDao, peliculasDao, usuariosDao }) {
  return {
    getReservas: (filters) => getReservas(filters, reservasDao),
    getReservaById: (id) => getReservaById(id, reservasDao),
    createReserva: (data) => createReserva(data, reservasDao, peliculasDao, usuariosDao),
    updateReserva: (id, changes) => updateReserva(id, changes, reservasDao),
    deleteReserva: (id) => deleteReserva(id, reservasDao),
  };
}
export default makeReservaUseCases;
