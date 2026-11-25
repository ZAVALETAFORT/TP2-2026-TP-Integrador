// Códigos existentes en AppError, schemas y errorHandler.
const ERROR_CATALOG = {
  VALIDACION_ERROR: [400, "Datos inválidos"],
  INVALID_JSON: [400, "JSON inválido"],
  CANTIDAD_INVALIDA: [400, "La cantidad debe ser un entero positivo"],
  CAPACIDAD_INSUFICIENTE: [
    400,
    "La capacidad no puede ser menor que los lugares ocupados",
  ],

  TOKEN_MISSING: [401, "Falta el header Authorization: Bearer <token>"],
  TOKEN_INVALID: [401, "Token inválido"],
  TOKEN_EXPIRED: [401, "El token venció, iniciá sesión de nuevo"],
  INVALID_CREDENTIALS: [401, "Email o contraseña incorrectos"],

  FORBIDDEN: [403, "No tenés permiso para realizar esta acción"],

  USUARIO_NOT_FOUND: [404, "No existe un usuario con ese ID"],
  PELICULA_NOT_FOUND: [404, "No existe una película con ese ID"],
  RESERVA_NOT_FOUND: [404, "No existe una reserva con ese ID"],

  EMAIL_DUPLICATED: [409, "El email ya está registrado"],
  USUARIO_CON_RESERVAS: [409, "No se puede eliminar un usuario con reservas"],
  PELICULA_CON_RESERVAS: [
    409,
    "No se puede eliminar una película con reservas",
  ],
  RESERVA_DUPLICADA: [
    409,
    "El usuario ya tiene una reserva activa para esta película",
  ],
  CUPOS_INSUFICIENTES: [409, "No hay suficientes cupos disponibles"],
  CUPOS_INCONSISTENTES: [409, "No se pudieron devolver los cupos"],
  RESERVA_NO_ACTIVA: [409, "No se puede modificar una reserva cancelada"],
  RESERVA_MODIFICADA: [409, "La reserva fue modificada por otra operación"],

  INTERNAL_ERROR: [500, "Error interno del servidor"],
};

// Genera un ejemplo de error con el formato real de la API.
function errorExample(code) {
  const entry = ERROR_CATALOG[code];

  if (!entry) throw new Error(`Error no documentado: ${code}`);

  return {
    error: { code, message: entry[1] },
  };
}

export { ERROR_CATALOG, errorExample };
