import AppError from "../../errors/AppError.js";

// Busca una reserva por ID y verifica su titularidad.
async function getReservaById(id, actor, dao) {
  const reserva = await dao.getById(id);

  if (reserva && actor.rol !== "admin" && reserva.usuarioId !== actor.id) {
    throw new AppError(
      "FORBIDDEN",
      "No tenés permiso para acceder a esta reserva",
      403,
    );
  }

  return reserva;
}

export default getReservaById;