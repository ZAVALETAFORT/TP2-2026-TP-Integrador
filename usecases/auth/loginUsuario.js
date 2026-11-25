import AppError from "../../errors/AppError.js";

// Caso de uso: autenticar un usuario.
async function loginUsuario(data, usuariosDao, hasher, tokens) {
  const email = data.email.trim().toLowerCase();

  // Buscar al usuario en el DAO seleccionado.
  const usuario = await usuariosDao.getByEmail(email);

  // Comprobar su contraseña contra el hash almacenado.
  if (
    !usuario?.passwordHash ||
    !(await hasher.compare(data.password, usuario.passwordHash))
  ) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "Email o contraseña incorrectos",
      401
    );
  }

  // GENERA JWT con el ID y rol del usuario.
  const token = tokens.sign({
    sub: String(usuario.id),
    rol: usuario.rol
  });

  // No devolver el hash ni la contraseña.
  return {
    token,
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }
  };
}

export default loginUsuario;