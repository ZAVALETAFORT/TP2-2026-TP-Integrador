// Consulta las reservas utilizando los filtros recibidos.
async function getReservas(filters, dao) {
  return dao.getAll(filters);
}

export default getReservas;