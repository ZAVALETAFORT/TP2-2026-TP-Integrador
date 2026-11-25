import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";

// Factory del servicio de tokens.
function createTokenService({ secret, expiresIn }) { // Recibe la clave secreta y el tiempo de expiración del token.
  return {
    // Genera un token firmado.
    sign: (payload) => jwt.sign(payload, secret, { expiresIn }),

    // Comprueba firma y vencimiento del token.
    verify(token) {
      try {
        return jwt.verify(token, secret, {
          algorithms: ["HS256"]
        });
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          throw new AppError(
            "TOKEN_EXPIRED",
            "El token venció, iniciá sesión de nuevo",
            401
          );
        }

        throw new AppError(
          "TOKEN_INVALID",
          "Token inválido",
          401
        );
      }
    }
  };
}

export default createTokenService;