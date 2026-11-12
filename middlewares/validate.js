import AppError from "../errors/AppError.js";

//Mi funcion validate recibe un schema Zod y retorna un middleware que valida el body del request
function validate(schema) {
  return (req, res, next) => {

    //Verifico si el req.body JSON cumple mis reglas del sqhema
    const result = schema.safeParse(req.body);

    //Si falla no sigo y paso error al middleware de manejo de errores (errorHandler)
    if (!result.success) {

      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));

      //Le paso el error al middleware de manejo de errores (errorHandler)
      return next(
        new AppError("VALIDACION_ERROR", "DATOS INVALIDOS", 400, details),
      );
    }

    //Si es valido entonces procesamos
    req.body = result.data;

    next();
  };
}

export default validate;
