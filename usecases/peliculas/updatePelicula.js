import AppError from "../../errors/AppError.js";

// Caso de uso: actualizar una película.
async function updatePelicula(id, changes, dao) {
  // Consultamos la película actual.
  const peliculaActual = await dao.getById(id);

  if (!peliculaActual) return null;

  // Copiamos los cambios para no modificar el objeto recibido.
  const cambios = { ...changes };

  // Normalizamos la fecha solo si fue modificada.
  if (cambios.fechaProyeccion !== undefined) {
    cambios.fechaProyeccion = new Date(cambios.fechaProyeccion).toISOString();
  }

  // Recalculamos los cupos si cambia la capacidad.
  if (cambios.capacidadTotal !== undefined) {
    const ocupados =
      peliculaActual.capacidadTotal - peliculaActual.cuposDisponibles;

    const nuevosCupos = cambios.capacidadTotal - ocupados;

    if (nuevosCupos < 0) {
      throw new AppError(
        "CAPACIDAD_INSUFICIENTE",
        "La capacidad no puede ser menor que los lugares ocupados",
        400,
      );
    }

    cambios.cuposDisponibles = nuevosCupos;
  }

  // Guardamos los cambios mediante el DAO elegido.
  return dao.update(id, cambios);
}

export default updatePelicula;
