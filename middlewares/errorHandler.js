import AppError from "../errors/AppError.js";

// Middleware de manejo de errores
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message, ... (err.details && { details: err.details })
        
      }
    });
  }

   // JSON malformado recibido por express.json().
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "JSON inválido"
      }
    });
  }

  //Muestro error en consola 
  console.error(err);

  //Otros errores no manejados: Devuelvo un error genérico al cliente
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor"
    }
  });
}

export default errorHandler;