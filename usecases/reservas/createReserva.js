import AppError from "../../errors/AppError.js";
import EVENTS from "../../events/eventNames.js";

// Valida las reglas del negocio, crea la reserva y emite el evento.
async function createReserva(
  data,
  reservasDao,
  peliculasDao,
  usuariosDao,
  events,
) {
  // Comprueba que la cantidad sea válida.
  if (!Number.isSafeInteger(data.cantidad) || data.cantidad <= 0) {
    throw new AppError(
      "CANTIDAD_INVALIDA",
      "La cantidad debe ser un entero positivo",
      400,
    );
  }

  // Verifica que exista el usuario.
  const usuario = await usuariosDao.getById(data.usuarioId);

  if (!usuario) {
    throw new AppError(
      "USUARIO_NOT_FOUND",
      "No existe un usuario con ese ID",
      404,
    );
  }

  // Verifica que exista la película.
  const pelicula = await peliculasDao.getById(data.peliculaId);

  if (!pelicula) {
    throw new AppError(
      "PELICULA_NOT_FOUND",
      "No existe una película con ese ID",
      404,
    );
  }

  // Impide duplicar una reserva activa para la misma película.
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

  // Comprueba la disponibilidad de lugares.
  if (pelicula.cuposDisponibles < data.cantidad) {
    throw new AppError(
      "CUPOS_INSUFICIENTES",
      "No hay suficientes cupos disponibles",
      409,
    );
  }

  // El DAO registra la reserva y descuenta los cupos.
  const reserva = await reservasDao.reservar(data);

  // Emite un evento para notificar a los listeners que se creó la reserva.
  events.emit(EVENTS.RESERVA_CREADA, {
    id: reserva.id,
    usuarioId: reserva.usuarioId,
    peliculaId: reserva.peliculaId,
    cantidad: reserva.cantidad,
  });

  return reserva;
}

export default createReserva;
