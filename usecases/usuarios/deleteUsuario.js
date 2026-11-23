import AppError from "../../errors/AppError.js";

// Si el usuario tiene reservas, entonces NO se puede eliminar 
async function deleteUsuario(id, dao, reservasDao) {
  const reservas = await reservasDao.getAll({
    usuarioId: Number(id)
  });

  if (reservas.length > 0) {
    throw new AppError(
      "USUARIO_CON_RESERVAS",
      "No se puede eliminar un usuario con reservas",
      409
    );
  }

  return dao.delete(id);
}

export default deleteUsuario;