import test from "node:test";
import assert from "node:assert/strict";

import peliculasDao from "../dao/peliculasMemoryDao.js";
import usuariosDao from "../dao/usuariosMemoryDao.js";
import reservasDao from "../dao/reservasMemoryDao.js";
import makePeliculaUseCases from "../usecases/peliculas/makePeliculaUseCases.js";

const casos = makePeliculaUseCases(peliculasDao, reservasDao);

const fechaProyeccion = "2027-02-20T21:00:00-03:00";

// Compruebo que pueda crear, consultar, modificar y borrar peliculas.
test("CRUD completo de peliculas", async () => {
  const pelicula = await casos.createPelicula({
    titulo: "Interestelar",
    fechaProyeccion,
    capacidadTotal: 3,
  });

  assert.equal(pelicula.cuposDisponibles, 3);

  const encontrada = await casos.getPeliculaById(pelicula.id);
  assert.equal(encontrada.titulo, "Interestelar");

  const lista = await casos.getPeliculas();
  assert.equal(lista.length, 1);

  const modificada = await casos.updatePelicula(pelicula.id, {
    titulo: "Interestelar 2",
  });

  assert.equal(modificada.titulo, "Interestelar 2");

  const eliminada = await casos.deletePelicula(pelicula.id);
  assert.equal(eliminada, true);

  assert.equal(await casos.getPeliculaById(pelicula.id), null);
});

// Compruebo que no pueda reducir cupos ocupados ni borrar la pelicula.
test("Protege capacidad y peliculas con reservas", async () => {
  const pelicula = await casos.createPelicula({
    titulo: "Matrix",
    fechaProyeccion,
    capacidadTotal: 3,
  });

  const usuario = await usuariosDao.save({
    nombre: "Cliente Test",
    email: "cliente.peliculas@test.com",
  });

  // El cliente ocupa 2 de los 3 lugares.
  await reservasDao.reservar({
    usuarioId: usuario.id,
    peliculaId: pelicula.id,
    cantidad: 2,
  });

  // No puedo bajar la capacidad a 1 si hay 2 ocupados.
  await assert.rejects(
    () => casos.updatePelicula(pelicula.id, { capacidadTotal: 1 }),
    { code: "CAPACIDAD_INSUFICIENTE", statusCode: 400 },
  );

  // Tampoco puedo borrar una pelicula que tiene reservas.
  await assert.rejects(() => casos.deletePelicula(pelicula.id), {
    code: "PELICULA_CON_RESERVAS",
    statusCode: 409,
  });

  assert.equal((await casos.getPeliculaById(pelicula.id)).cuposDisponibles, 1);
});