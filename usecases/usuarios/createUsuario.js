import AppError from "../../errors/AppError.js";

// Caso de uso: crear usuario.
async function createUsuario(data, dao, hasher) {

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

  // Calculamos el hash si se recibió una contraseña.
const passwordHash = data.password === undefined ? null : await hasher.hash(data.password);

  // Solo se crean clientes desde este caso de uso.
  return dao.save({
    nombre: data.nombre,
    email,
    passwordHash
  });
}

export default createUsuario;