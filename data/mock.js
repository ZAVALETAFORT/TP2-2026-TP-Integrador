// Datos de demostración. Solo se cargan si las tres entidades están vacías.
const USUARIOS = [
  ["Ana García", "ana.demo@example.com"],
  ["Bruno Ruiz", "bruno.demo@example.com"],
  ["Carla Díaz", "carla.demo@example.com"],
  ["Diego Pérez", "diego.demo@example.com"],
  ["Elena Torres", "elena.demo@example.com"],
  ["Facundo López", "facundo.demo@example.com"],
  ["Gabriela Silva", "gabriela.demo@example.com"],
  ["Hugo Martínez", "hugo.demo@example.com"],
  ["Inés Romero", "ines.demo@example.com"],
  ["Julián Castro", "julian.demo@example.com"],
  ["Karina Vega", "karina.demo@example.com"],
  ["Lucas Molina", "lucas.demo@example.com"],
];

// [título, género, capacidad total]. Las funciones usan fechas futuras.
const PELICULAS = [
  ["Interestelar", "Ciencia ficción", 20],
  ["El origen", "Ciencia ficción", 15],
  ["Matrix", "Acción", 10],
  ["Toy Story", "Animación", 30],
  ["Duna: Parte dos", "Ciencia ficción", 12],
  ["Titanic", "Romance", 25],
  ["Avatar", "Aventura", 50],
  ["Coco", "Animación", 18],
  ["Gladiador", "Acción", 8],
  ["Oppenheimer", "Drama", 40],
  ["Barbie", "Comedia", 16],
  ["El señor de los anillos", "Fantasía", 24],
  ["Sala mínima", "Drama", 1],
  ["Función VIP", "Drama", 4],
];

// Cada par es [índice de usuario, cantidad de lugares].
// Se crean primero las canceladas para permitir luego una nueva
// reserva activa del mismo usuario y película (ejemplo: Barbie).
const RESERVAS = [
  {
    activas: [
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 2],
      [4, 1],
    ],
  },
  {
    canceladas: [[2, 2]],
    activas: [
      [0, 5],
      [3, 2],
      [5, 3],
    ],
  },
  {
    activas: [
      [2, 4],
      [4, 3],
      [6, 3],
    ],
  }, // Sala completa.
  {}, // Sin reservas.
  {
    activas: [
      [1, 7],
      [7, 4],
    ],
  }, // Queda 1 lugar.
  {
    canceladas: [
      [2, 2],
      [3, 1],
    ],
    activas: [
      [8, 3],
      [9, 4],
      [10, 3],
      [11, 2],
    ],
  },
  {
    activas: [
      [0, 2],
      [1, 5],
      [2, 3],
      [3, 4],
      [4, 4],
      [5, 4],
      [6, 2],
    ],
  },
  {
    canceladas: [[11, 2]],
    activas: [
      [8, 2],
      [9, 1],
      [10, 4],
    ],
  },
  { canceladas: [[4, 1]], activas: [[5, 1]] },
  {
    activas: [
      [0, 3],
      [1, 4],
      [2, 5],
      [3, 1],
      [4, 2],
    ],
  },
  {
    canceladas: [
      [0, 2],
      [1, 3],
    ],
    activas: [
      [0, 4],
      [5, 4],
    ],
  },
  {
    activas: [
      [6, 6],
      [7, 5],
      [8, 4],
      [9, 3],
    ],
  },
  { activas: [[10, 1]] }, // Sala de 1 lugar completa.
  { canceladas: [[11, 4]] }, // Solo cancelaciones.
];

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

  // No modificar ni mezclar datos de una base ya utilizada.
  if (usuarios.length || peliculas.length || reservas.length) {
    console.log("[Mock] Hay datos existentes: se omite la precarga.");
    return;
  }

  const usuariosCreados = [];
  for (const [nombre, email] of USUARIOS) {
    usuariosCreados.push(
      await usuariosUseCases.createUsuario({ nombre, email }),
    );
  }

  const peliculasCreadas = [];
  for (const [i, [titulo, genero, capacidadTotal]] of PELICULAS.entries()) {
    const fechaProyeccion = new Date(
      Date.now() + (7 + i * 3) * 86_400_000,
    ).toISOString();
    peliculasCreadas.push(
      await peliculasUseCases.createPelicula({
        titulo,
        genero,
        fechaProyeccion,
        capacidadTotal,
      }),
    );
  }

  let total = 0;
  let canceladas = 0;
  for (const [i, escenario] of RESERVAS.entries()) {
    for (const [estado, pares] of [
      ["cancelada", escenario.canceladas ?? []],
      ["activa", escenario.activas ?? []],
    ]) {
      for (const [indiceUsuario, cantidad] of pares) {
        const reserva = await reservasUseCases.createReserva({
          usuarioId: usuariosCreados[indiceUsuario].id,
          peliculaId: peliculasCreadas[i].id,
          cantidad,
        });
        if (estado === "cancelada") {
          await reservasUseCases.updateReserva(reserva.id, {
            estado: "cancelada",
          });
          canceladas++;
        }
        total++;
      }
    }
  }

  console.log(
    `[Mock] Cargados ${usuariosCreados.length} usuarios, ${peliculasCreadas.length} películas y ${total} reservas (${total - canceladas} activas, ${canceladas} canceladas).`,
  );
}

export default seedMockData;