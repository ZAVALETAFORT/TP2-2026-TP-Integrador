//Hereda de clase Error de javaScript
class AppError extends Error {ocultar
    constructor(code, messaje, statusCode = 400, details){
        super(messaje)

        this.name = "AppError";
        this.code = code; //El ID del error
        this.statusCode = statusCode; //Estado HTTP que retorno
        this.details = details; //Detalles de validacion
    }
}

export default AppError;