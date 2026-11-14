import AppError from "../../errors/AppError.js";

// Caso de uso: actualizar una película.
async function updatePelicula(id, changes, dao) {

  // Consultamos los valores actuales.
  const peliculaActual = await dao.getById(id);

  // Si no existe, informamos al Controller.
  if (!peliculaActual) return null;

  // Solo recalculamos cupos si cambia la capacidad total.
  if (changes.capacidadTotal !== undefined) {

    const ocupados =
      peliculaActual.capacidadTotal - peliculaActual.cuposDisponibles;

    const nuevosCupos = changes.capacidadTotal - ocupados;

    // No permitimos una capacidad menor a los lugares ocupados.
    if (nuevosCupos < 0) {
      throw new AppError(
        "CAPACIDAD_INSUFICIENTE",
        "La capacidad no puede ser menor que los lugares ocupados",
        400
      );
    }

    // Agregamos los cupos calculados a los cambios.
    changes = {
      ...changes,
      cuposDisponibles: nuevosCupos
    };
  }

  // Persistimos la actualización.
  return dao.update(id, changes);
}

export default updatePelicula;

//eliminar lo mando a otro caso de uso 