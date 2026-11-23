// Elimina la reserva y restituye los cupos si estaba activa.
async function deleteReserva(id, dao) {
  return dao.eliminar(id);
}

export default deleteReserva;