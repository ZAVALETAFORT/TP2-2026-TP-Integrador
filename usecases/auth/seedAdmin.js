// Crea el administrador inicial si todavía no existe.
// Si no configuramos administrador, omitimos la creación.

async function seedAdmin({ email, password }, dao, hasher) {
  
  if (!email || !password) {
    console.log("[Seed] Administrador inicial no configurado");
    return;
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres");
  }

  const emailNormalizado = email.trim().toLowerCase();

  // Comprobamos si ya existe ese usuario.
  const existente = await dao.getByEmail(emailNormalizado);

  if (existente) {
    if (existente.rol !== "admin") {
      console.warn("[Seed] El email configurado ya pertenece a un cliente");
    }

    return;
  }

  // Nunca guardamos la contraseña en texto plano.
  const passwordHash = await hasher.hash(password);

  // El administrador se crea directamente a través del DAO.
  await dao.save({
    nombre: "Administrador",
    email: emailNormalizado,
    rol: "admin",
    passwordHash,
  });

  console.log(`[Seed] Administrador creado: ${emailNormalizado}`);
}

export default seedAdmin;