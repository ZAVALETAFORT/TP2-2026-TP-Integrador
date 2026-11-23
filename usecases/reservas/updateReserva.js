import AppError from "../../errors/AppError.js";

// Decide si se cambia la cantidad o se cancela la reserva.
async function updateReserva(id, changes, dao) {
  const reserva = await dao.getById(id);

  if (!reserva) return null;

  if (changes.estado === "cancelada") {
    return dao.cancelar(id);
  }

  if (reserva.estado !== "activa") {
    throw new AppError(
      "RESERVA_NO_ACTIVA",
      "No se puede modificar una reserva cancelada",
      409
    );
  }

  // El DAO modifica los cupos según la diferencia de cantidad.
  if (changes.cantidad !== undefined) {
    return dao.cambiarCantidad(id, changes.cantidad);
  }

  return reserva;
}

export default updateReserva;