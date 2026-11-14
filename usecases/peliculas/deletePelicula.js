// Caso de uso: eliminar una película por ID

async function deletePelicula(id, dao) {

    return dao.delete(id);
}

export default deletePelicula;