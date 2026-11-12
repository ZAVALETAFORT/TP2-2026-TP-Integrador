import { validate } from "zod";
import AppError from "../errors/AppError";

function validate(schema) {
  return (req, res, next) => {
    
    const result = schema.safeParse(req.body); //Valido el JSON que entra en el body

    if (!result.sussess) {
      //si es invalido mando detalle del error

      const details = result.error.issues.map((issues) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));

      return next(
        new AppError("VALIDACION_ERROR", "DATOS INVALIDOS", 400, details),
      );
    }

    //Si SI es valido entonces procesamos
    req.body = result.data;

    next();
  };
}

export default validate;