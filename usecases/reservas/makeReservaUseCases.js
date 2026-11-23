import getReservas from "./getReservas.js";
import getReservaById from "./getReservaById.js";
import createReserva from "./createReserva.js";
import updateReserva from "./updateReserva.js";
import deleteReserva from "./deleteReserva.js";

// Conecta los DAO con los casos de uso de Reservas.
function makeReservaUseCases({ reservasDao, peliculasDao, usuariosDao }) {
  return {
    // Lista las reservas aplicando filtros.
    getReservas: (filters) => getReservas(filters, reservasDao),

    // Consulta una reserva por ID.
    getReservaById: (id) => getReservaById(id, reservasDao),

    // Crea una reserva validando usuario, película y cupos.
    createReserva: (data) =>
      createReserva(data, reservasDao, peliculasDao, usuariosDao),

    // Modifica la cantidad o cancela una reserva.
    updateReserva: (id, changes) => updateReserva(id, changes, reservasDao),

    // Elimina una reserva.
    deleteReserva: (id) => deleteReserva(id, reservasDao),
  };
}

export default makeReservaUseCases;