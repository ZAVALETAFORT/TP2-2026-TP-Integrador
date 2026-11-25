import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";

import usuariosMemoryDao from "../dao/usuariosMemoryDao.js";
import peliculasMemoryDao from "../dao/peliculasMemoryDao.js";
import { ReservasMemoryDao } from "../dao/reservasMemoryDao.js";
import makeReservaUseCases from "../usecases/reservas/makeReservaUseCases.js";
import EVENTS from "../events/eventNames.js";

let secuencia = 0;

// Preparo users, una pelicula y los casos de uso para cada prueba
async function crearEscenario() {
  const numero = ++secuencia;

  const cliente1 = await usuariosMemoryDao.save({
    nombre: "Cliente Uno",
    email: `cliente1.${numero}@test.com`,
  });

  const cliente2 = await usuariosMemoryDao.save({
    nombre: "Cliente Dos",
    email: `cliente2.${numero}@test.com`,
  });

  const pelicula = await peliculasMemoryDao.save({
    titulo: `Pelicula Test ${numero}`,
    fechaProyeccion: "2027-02-20T21:00:00.000Z",
    capacidadTotal: 3,
    cuposDisponibles: 3,
  });

  // Uso un DAO nuevo para no mezclar las reservas entre pruebas.
  const reservasDao = new ReservasMemoryDao(
    usuariosMemoryDao,
    peliculasMemoryDao
  );

  const events = new EventEmitter();

  // Armo los casos de uso igual que en el Container.
  const casos = makeReservaUseCases({
    reservasDao,
    peliculasDao: peliculasMemoryDao,
    usuariosDao: usuariosMemoryDao,
    events,
  });

  return {
    cliente1,
    cliente2,
    pelicula,
    casos,
    events,
    actor1: { id: cliente1.id, rol: "cliente" },
    actor2: { id: cliente2.id, rol: "cliente" },
    admin: { id: 999, rol: "admin" },
  };
}

// Compruebo que reservar descuente lugares y dispare el evento.
test("Crear reserva descuenta cupos y emite evento", async () => {
  const { cliente1, pelicula, casos, events, actor1 } =
    await crearEscenario();

  let eventosRecibidos = 0;

  events.on(EVENTS.RESERVA_CREADA, () => {
    eventosRecibidos++;
  });

  const reserva = await casos.createReserva(
    { peliculaId: pelicula.id, cantidad: 2 },
    actor1
  );

  // Verifico que se guardo bien y se emitio un evento.
  assert.equal(reserva.usuarioId, cliente1.id);
  assert.equal(reserva.estado, "activa");
  assert.equal(eventosRecibidos, 1);

  // De 3 lugares deben quedar 1 disponible.
  const actualizada = await peliculasMemoryDao.getById(pelicula.id);
  assert.equal(actualizada.cuposDisponibles, 1);
});

// Compruebo que cada cliente vea solo sus reservas.
test("Cliente ve solamente sus reservas", async () => {
  const { cliente1, cliente2, pelicula, casos, actor1, actor2, admin } =
    await crearEscenario();

  await casos.createReserva(
    { peliculaId: pelicula.id, cantidad: 1 },
    actor1
  );

  const reservaAjena = await casos.createReserva(
    { peliculaId: pelicula.id, cantidad: 1 },
    actor2
  );

  const propias = await casos.getReservas({}, actor1);

  // El cliente ve una sola reserva: la suya.
  assert.equal(propias.length, 1);
  assert.equal(propias[0].usuarioId, cliente1.id);

  // No puede filtrar ni consultar reservas de otro usuario.
  await assert.rejects(
    () => casos.getReservas({ usuarioId: cliente2.id }, actor1),
    { code: "FORBIDDEN", statusCode: 403 }
  );

  await assert.rejects(
    () => casos.getReservaById(reservaAjena.id, actor1),
    { code: "FORBIDDEN", statusCode: 403 }
  );

  // El administrador puede ver las dos.
  const todas = await casos.getReservas({}, admin);
  assert.equal(todas.length, 2);
});

// Compruebo que no se dupliquen reservas ni se vendan lugares de mas.
test("Rechaza reservas duplicadas y cupos insuficientes", async () => {
  const { pelicula, casos, actor1, actor2 } =
    await crearEscenario();

  await casos.createReserva(
    { peliculaId: pelicula.id, cantidad: 2 },
    actor1
  );

  // El mismo cliente no puede reservar dos veces la misma pelicula.
  await assert.rejects(
    () => casos.createReserva(
      { peliculaId: pelicula.id, cantidad: 1 },
      actor1
    ),
    { code: "RESERVA_DUPLICADA", statusCode: 409 }
  );

  // Solo queda 1 lugar: no puede reservar 2.
  await assert.rejects(
    () => casos.createReserva(
      { peliculaId: pelicula.id, cantidad: 2 },
      actor2
    ),
    { code: "CUPOS_INSUFICIENTES", statusCode: 409 }
  );
});

// Compruebo que un cliente no toque reservas ajenas.
test("Impide modificar y eliminar reservas ajenas", async () => {
  const { pelicula, casos, actor1, actor2 } =
    await crearEscenario();

  const reserva = await casos.createReserva(
    { peliculaId: pelicula.id, cantidad: 2 },
    actor1
  );

  // Otro cliente intenta modificarla y recibe 403.
  await assert.rejects(
    () => casos.updateReserva(reserva.id, { cantidad: 1 }, actor2),
    { code: "FORBIDDEN", statusCode: 403 }
  );

  // Tampoco puede eliminarla.
  await assert.rejects(
    () => casos.deleteReserva(reserva.id, actor2),
    { code: "FORBIDDEN", statusCode: 403 }
  );

  // Compruebo que la reserva sigue igual.
  const guardada = await casos.getReservaById(reserva.id, actor1);
  assert.equal(guardada.cantidad, 2);
});

// Compruebo que modificar, cancelar y borrar no altere mal los cupos.
test("Modificar, cancelar y eliminar mantienen los cupos", async () => {
  const { pelicula, casos, actor1, admin } =
    await crearEscenario();

  const reserva = await casos.createReserva(
    { peliculaId: pelicula.id, cantidad: 2 },
    actor1
  );

  // Bajo de 2 lugares a 1: se devuelve un cupo.
  const modificada = await casos.updateReserva(
    reserva.id,
    { cantidad: 1 },
    actor1
  );

  assert.equal(modificada.cantidad, 1);
  assert.equal(
    (await peliculasMemoryDao.getById(pelicula.id)).cuposDisponibles,
    2
  );

  // Cancelo la reserva: se devuelve el lugar restante.
  const cancelada = await casos.updateReserva(
    reserva.id,
    { estado: "cancelada" },
    actor1
  );

  assert.equal(cancelada.estado, "cancelada");

  // Cancelo de nuevo para comprobar que no duplique cupos.
  await casos.updateReserva(
    reserva.id,
    { estado: "cancelada" },
    actor1
  );

  assert.equal(
    (await peliculasMemoryDao.getById(pelicula.id)).cuposDisponibles,
    3
  );

  // El administrador elimina la reserva cancelada.
  const eliminada = await casos.deleteReserva(reserva.id, admin);
  assert.equal(eliminada, true);

  // Compruebo que ya no existe y los 3 cupos siguen disponibles.
  const inexistente = await casos.getReservaById(reserva.id, actor1);
  assert.equal(inexistente, null);

  assert.equal(
    (await peliculasMemoryDao.getById(pelicula.id)).cuposDisponibles,
    3
  );
});