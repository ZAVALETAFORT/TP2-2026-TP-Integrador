import getReservas from "./getReservas.js";
import getReservaById from "./getReservaById.js";
import createReserva from "./createReserva.js";
import updateReserva from "./updateReserva.js";
import deleteReserva from "./deleteReserva.js";

// Inyecta los DAO y el bus de eventos en los casos de uso.
function makeReservaUseCases({
  reservasDao,
  peliculasDao,
  usuariosDao,
  events
}) {
  return {
    // Lista reservas.
    getReservas: (filters) =>
      getReservas(filters, reservasDao),

    // Consulta una reserva por ID.
    getReservaById: (id) =>
      getReservaById(id, reservasDao),

    // Crea reservas y permite emitir el evento correspondiente.
    createReserva: (data) =>
      createReserva(
        data,
        reservasDao,
        peliculasDao,
        usuariosDao,
        events
      ),

    // Modifica la cantidad o cancela.
    updateReserva: (id, changes) =>
      updateReserva(id, changes, reservasDao),

    // Elimina una reserva.
    deleteReserva: (id) =>
      deleteReserva(id, reservasDao)
  };
}

export default makeReservaUseCases;