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
    getReservas: (filters, actor) =>
      getReservas(filters, actor, reservasDao),

    // Consulta una reserva por ID.
    getReservaById: (id, actor) =>
      getReservaById(id, actor, reservasDao),

    // Crea reservas y permite emitir el evento correspondiente.
    createReserva: (data, actor) =>
      createReserva(
        data,
        actor,
        reservasDao,
        peliculasDao,
        usuariosDao,
        events
      ),

    // Modifica la cantidad o cancela.
    updateReserva: (id, changes, actor) =>
      updateReserva(id, changes, actor, reservasDao),

    // Elimina una reserva.
    deleteReserva: (id, actor) =>
      deleteReserva(id, actor, reservasDao)
  };
}

export default makeReservaUseCases;