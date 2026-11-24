import bcrypt from "bcryptjs";

// Servicio para generar y comparar contraseñas hasheadas.
function createPasswordHasher({ rounds }) {
  return {
    hash: (plain) => bcrypt.hash(plain, rounds),
    compare: (plain, hash) => bcrypt.compare(plain, hash),
  };
}

export default createPasswordHasher;