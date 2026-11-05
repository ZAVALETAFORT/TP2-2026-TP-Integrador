// Registra cada solicitud antes de que llegue a su ruta.
function logger(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);

  // Continuamos hacia el siguiente middleware o Router.
  next();
}

export default logger;