import test from "node:test";
import assert from "node:assert/strict";

import usuariosDao from "../dao/usuariosMemoryDao.js";
import peliculasDao from "../dao/peliculasMemoryDao.js";
import reservasDao from "../dao/reservasMemoryDao.js";
import makeUsuarioUseCases from "../usecases/usuarios/makeUsuarioUseCases.js";
import createPasswordHasher from "../security/passwordHasher.js";

const hasher = createPasswordHasher({ rounds: 5 });
const casos = makeUsuarioUseCases(usuariosDao, reservasDao, hasher);

// Compruebo que pueda crear, consultar, modificar y borrar usuarios.
test("CRUD completo de usuarios", async () => {
  const usuario = await casos.createUsuario({
    nombre: "Ana",
    email: "ANA.USUARIOS@test.com",
    password: "clave123",
  });

  assert.equal(usuario.email, "ana.usuarios@test.com");
  assert.equal(usuario.rol, "cliente");

  const encontrado = await casos.getUsuarioById(usuario.id);
  assert.equal(encontrado.nombre, "Ana");

  const lista = await casos.getUsuarios();
  assert.equal(lista.length, 1);

  const modificado = await casos.updateUsuario(usuario.id, {
    nombre: "Ana Lopez",
  });

  assert.equal(modificado.nombre, "Ana Lopez");

  const eliminado = await casos.deleteUsuario(usuario.id);
  assert.equal(eliminado, true);

  assert.equal(await casos.getUsuarioById(usuario.id), null);
});

// Compruebo que no pueda registrar dos veces el mismo email.
test("Rechaza emails duplicados", async () => {
  await casos.createUsuario({
    nombre: "Bruno",
    email: "bruno.usuarios@test.com",
  });

  await assert.rejects(
    () =>
      casos.createUsuario({
        nombre: "Otro Bruno",
        email: "BRUNO.USUARIOS@test.com",
      }),
    { code: "EMAIL_DUPLICATED", statusCode: 409 },
  );
});

// Compruebo que no pueda borrar un usuario que tiene reservas.
test("Impide borrar usuarios con reservas", async () => {
  const usuario = await casos.createUsuario({
    nombre: "Carlos",
    email: "carlos.usuarios@test.com",
  });

  const pelicula = await peliculasDao.save({
    titulo: "Matrix",
    fechaProyeccion: "2027-02-20T21:00:00.000Z",
    capacidadTotal: 3,
    cuposDisponibles: 3,
  });

  await reservasDao.reservar({
    usuarioId: usuario.id,
    peliculaId: pelicula.id,
    cantidad: 1,
  });

  await assert.rejects(() => casos.deleteUsuario(usuario.id), {
    code: "USUARIO_CON_RESERVAS",
    statusCode: 409,
  });

  assert.notEqual(await casos.getUsuarioById(usuario.id), null);
});