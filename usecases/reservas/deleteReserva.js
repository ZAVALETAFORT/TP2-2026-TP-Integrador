// Elimina la reserva y restituye cupos si todavía estaba activa.
async function deleteReserva(id, dao) {
  return dao.delete(id);
}

export default deleteReserva;