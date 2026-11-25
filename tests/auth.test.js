import test from "node:test";
import assert from "node:assert/strict";

import usuariosDao from "../dao/usuariosMemoryDao.js";
import createUsuario from "../usecases/usuarios/createUsuario.js";
import loginUsuario from "../usecases/auth/loginUsuario.js";
import createPasswordHasher from "../security/passwordHasher.js";
import createTokenService from "../security/tokenService.js";
import createAuthMiddlewares from "../middlewares/auth.js";

const hasher = createPasswordHasher({ rounds: 5 });
const tokens = createTokenService({
  secret: "clave-para-pruebas",
  expiresIn: "1h",
});

// Compruebo el hash de la contraseña y el login.
test("Registro y login generan un JWT valido", async () => {
  const usuario = await createUsuario(
    {
      nombre: "Ana",
      email: "ana.auth@test.com",
      password: "clave123",
    },
    usuariosDao,
    hasher,
  );

  assert.notEqual(usuario.passwordHash, "clave123");
  assert.equal(await hasher.compare("clave123", usuario.passwordHash), true);

  const login = await loginUsuario(
    { email: "ana.auth@test.com", password: "clave123" },
    usuariosDao,
    hasher,
    tokens,
  );

  assert.equal(login.user.id, usuario.id);
  assert.equal(login.user.rol, "cliente");
  assert.equal(tokens.verify(login.token).sub, String(usuario.id));
  assert.equal(login.user.passwordHash, undefined);
});

// Compruebo que una contraseña incorrecta no permita entrar.
test("Login incorrecto devuelve 401", async () => {
  await createUsuario(
    {
      nombre: "Bruno",
      email: "bruno.auth@test.com",
      password: "clave123",
    },
    usuariosDao,
    hasher,
  );

  await assert.rejects(
    () =>
      loginUsuario(
        { email: "bruno.auth@test.com", password: "incorrecta" },
        usuariosDao,
        hasher,
        tokens,
      ),
    { code: "INVALID_CREDENTIALS", statusCode: 401 },
  );
});

// Compruebo que un JWT inventado sea rechazado.
test("JWT invalido devuelve 401", () => {
  assert.throws(() => tokens.verify("token-inventado"), {
    code: "TOKEN_INVALID",
    statusCode: 401,
  });
});

// Compruebo que un cliente no pueda ejecutar acciones de admin.
test("Middleware controla los permisos por rol", () => {
  const { authenticate, authorize } = createAuthMiddlewares(tokens);

  const token = tokens.sign({ sub: "10", rol: "cliente" });
  const req = { headers: { authorization: `Bearer ${token}` } };

  let error;
  authenticate(req, {}, (err) => {
    error = err;
  });

  assert.equal(error, undefined);
  assert.deepEqual(req.user, { id: 10, rol: "cliente" });

  authorize("admin")(req, {}, (err) => {
    error = err;
  });

  assert.equal(error.code, "FORBIDDEN");
  assert.equal(error.statusCode, 403);
});