import AppError from "../../errors/AppError.js";

// Valida las reglas del negocio y solicita confirmar la reserva.
async function createReserva(data, reservasDao, peliculasDao, usuariosDao) {
  if (!Number.isSafeInteger(data.cantidad) || data.cantidad <= 0) {
    throw new AppError(
      "CANTIDAD_INVALIDA",
      "La cantidad debe ser un entero positivo",
      400,
    );
  }

  const usuario = await usuariosDao.getById(data.usuarioId);

  if (!usuario) {
    throw new AppError(
      "USUARIO_NOT_FOUND",
      "No existe un usuario con ese ID",
      404,
    );
  }

  const pelicula = await peliculasDao.getById(data.peliculaId);

  if (!pelicula) {
    throw new AppError(
      "PELICULA_NOT_FOUND",
      "No existe una película con ese ID",
      404,
    );
  }

  // Impide que el usuario reserve dos veces la misma película.
  const existente = await reservasDao.getActive(
    data.usuarioId,
    data.peliculaId,
  );

  if (existente) {
    throw new AppError(
      "RESERVA_DUPLICADA",
      "El usuario ya tiene una reserva activa para esta película",
      409,
    );
  }

  if (pelicula.cuposDisponibles < data.cantidad) {
    throw new AppError(
      "CUPOS_INSUFICIENTES",
      "No hay suficientes cupos disponibles",
      409,
    );
  }

  // El DAO guarda la reserva y descuenta los cupos conjuntamente.
  return reservasDao.reservar(data);
}

export default createReserva;
