import AppError from "../errors/AppError.js";

// Ninguna ruta atendio el request, generamos un error 404.
function notFound(req, res, next) {
  //Le paso el error al middleware de manejo de errores (errorHandler)  
  next(new AppError(
    "ROUTE_NOT_FOUND",
    `Ruta ${req.method} ${req.originalUrl} inexistente`,
    404
  ));
}

export default notFound;