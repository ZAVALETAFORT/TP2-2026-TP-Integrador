import AppError from "../../errors/AppError.js";

// Impide eliminar una película SI tiene una reserva asociada. Se delega al DAO la eliminación.
async function deletePelicula(id, dao, reservasDao) {
  const reservas = await reservasDao.getAll({
    peliculaId: Number(id),
  });

  if (reservas.length > 0) {
    throw new AppError(
      "PELICULA_CON_RESERVAS",
      "No se puede eliminar una película con reservas",
      409,
    );
  }

  return dao.delete(id);
}

export default deletePelicula;
