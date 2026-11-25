import AppError from "../../errors/AppError.js";

// Busca una reserva por su ID y tambien restringo

async function getReservas(filters = {}, actor, dao) {
  if (actor.rol === "admin") return dao.getAll(filters);

  if (filters.usuarioId !== undefined && filters.usuarioId !== actor.id) {
    throw new AppError(
      "FORBIDDEN",
      "No tenés permiso para ver reservas ajenas solo las tuyas",
      403,
    );
  }

  return dao.getAll({ ...filters, usuarioId: actor.id });
}

export default getReservas;