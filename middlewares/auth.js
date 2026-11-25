import AppError from "../errors/AppError.js";

// Factory que recibe el servicio JWT  para usar en el container
function createAuthMiddlewares(tokens) {
  // Verifica quién es el usuario.
  function authenticate(req, res, next) {
    const header = req.headers.authorization ?? "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(
        new AppError(
          "TOKEN_MISSING",
          "Falta el header Authorization: Bearer <token>",
          401,
        ),
      );
    }

    try {
      const { sub, rol } = tokens.verify(token);

      req.user = {
        id: Number(sub),
        rol,
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  // Verifica si el usuario tiene alguno de los roles permitidos.
  const authorize =
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user?.rol)) {
        return next(
          new AppError(
            "FORBIDDEN",
            "No tenés permiso para realizar esta acción",
            403,
          ),
        );
      }

      next();
    };

  return { authenticate, authorize };
}

export default createAuthMiddlewares;