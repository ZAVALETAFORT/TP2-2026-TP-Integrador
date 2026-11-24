// mock.js
// Datos de demostración: solo se crean cuando la base está vacía.
async function seedMockData({
  usuariosUseCases,
  peliculasUseCases,
  reservasUseCases,
}) {
  const [usuarios, peliculas, reservas] = await Promise.all([
    usuariosUseCases.getUsuarios(),
    peliculasUseCases.getPeliculas(),
    reservasUseCases.getReservas(),
  ]);

  // Evita duplicados y protege datos existentes.
  if (usuarios.length > 0 || peliculas.length > 0 || reservas.length > 0) {
    console.log("[Mock] Datos existentes: no se realiza la precarga.");
    return;
  }

  // Las funciones tendrán fechas futuras al iniciar la aplicación.
  const fechaEnDias = (dias) =>
    new Date(Date.now() + dias * 86_400_000).toISOString();

  // Usuarios.
  const ana = await usuariosUseCases.createUsuario({
    nombre: "Ana García",
    email: "ana.demo@example.com",
  });

  const bruno = await usuariosUseCases.createUsuario({
    nombre: "Bruno Ruiz",
    email: "bruno.demo@example.com",
  });

  const carla = await usuariosUseCases.createUsuario({
    nombre: "Carla Díaz",
    email: "carla.demo@example.com",
  });

  // Películas.
  const interestelar = await peliculasUseCases.createPelicula({
    titulo: "Interestelar",
    genero: "Ciencia ficción",
    fechaProyeccion: fechaEnDias(7),
    capacidadTotal: 20,
  });

  const origen = await peliculasUseCases.createPelicula({
    titulo: "El origen",
    genero: "Ciencia ficción",
    fechaProyeccion: fechaEnDias(14),
    capacidadTotal: 15,
  });

  await peliculasUseCases.createPelicula({
    titulo: "Noche de estreno",
    genero: "Drama",
    fechaProyeccion: fechaEnDias(21),
    capacidadTotal: 12,
  });

  // Dos reservas activas para Interestelar.
  await reservasUseCases.createReserva({
    usuarioId: ana.id,
    peliculaId: interestelar.id,
    cantidad: 2,
  });

  await reservasUseCases.createReserva({
    usuarioId: bruno.id,
    peliculaId: interestelar.id,
    cantidad: 3,
  });

  // Reserva cancelada: demuestra la devolución de cupos.
  const reservaCancelada = await reservasUseCases.createReserva({
    usuarioId: carla.id,
    peliculaId: origen.id,
    cantidad: 1,
  });

  await reservasUseCases.updateReserva(reservaCancelada.id, {
    estado: "cancelada",
  });

  console.log(
    "[Mock] Precarga completa: 3 usuarios, 3 películas y 3 reservas (1 cancelada).",
  );
}

export default seedMockData;