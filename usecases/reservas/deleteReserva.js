import getReservaById from "./getReservaById.js";

// Elimina una reserva verificando previamente su titularidad.
async function deleteReserva(id, actor, dao) {
  const reserva = await getReservaById(id, actor, dao);

  if (!reserva) return false;

  return dao.delete(id);
}

export default deleteReserva;