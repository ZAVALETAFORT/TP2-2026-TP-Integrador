// Busca una reserva por su identificador.
async function getReservaById(id, dao) {
  return dao.getById(id);
}

export default getReservaById;