//Caso de uso: Crea la peli con el dao que le paso (Memory, sql, etc)
async function createPelicula(data, dao) {

    //Cada nueva peli inicia con cuposDisponibles = capacidadTotal
    const nuevaPelicula = { ...data, cuposDisponibles: data.capacidadTotal };

    //DAO es el que guarda en la base de datos (Memory, sql, etc)
    return dao.save(nuevaPelicula);
}

export default createPelicula;