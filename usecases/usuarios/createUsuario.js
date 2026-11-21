import AppError from "../../errors/AppError.js";

// Caso de uso: crear usuario.
async function createUsuario(data, dao) {

  // Normalizamos el email.
  const email = data.email.trim().toLowerCase();

  // Regla de negocio: no se repiten emails.
  const existente = await dao.getByEmail(email);

  if (existente) {
    throw new AppError(
      "EMAIL_DUPLICATED",
      "El email ya está registrado",
      409
    );
  }

  // Solo se crean clientes desde este caso de uso.
  return dao.save({
    nombre: data.nombre,
    email
  });
}

export default createUsuario;