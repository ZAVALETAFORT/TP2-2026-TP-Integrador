import AppError from "../../errors/AppError.js";

// Caso de uso: actualizar usuario.
async function updateUsuario(id, changes, dao) {

  const usuarioActual = await dao.getById(id);

  if (!usuarioActual) return null;

  const cambios = { ...changes };

  // El email se comprueba solo si fue modificado.
  if (cambios.email !== undefined) {

    cambios.email = cambios.email.trim().toLowerCase();

    const existente = await dao.getByEmail(cambios.email);

    // No es conflicto si el email pertenece al mismo usuario.
    if (existente && existente.id !== Number(id)) {
      throw new AppError(
        "EMAIL_DUPLICATED",
        "El email ya está registrado",
        409
      );
    }
  }

  return dao.update(id, cambios);
}

export default updateUsuario;