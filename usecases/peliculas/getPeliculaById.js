// Caso de uso: get de pelicula por ID, null si no la encuentra

async function getPeliculaById(id, dao) {
   
    return dao.getById(id);
}

export default getPeliculaById;