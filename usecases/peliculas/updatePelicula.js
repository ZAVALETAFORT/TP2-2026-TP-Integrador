import AppError from "../../utils/AppError.js";

//Caso de uso: update de pelicula por ID, null si no la encuentra

async function updatePelicula(id, changes, dao) {

    const peliculaActual = await dao.getById(id);

    if (!peliculaActual) return null; //Si no la encuentra, retorna null

    //LLEGUE HASTA ACA: 2. Ampliar el DAO