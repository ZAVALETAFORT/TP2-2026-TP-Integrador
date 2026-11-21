// Caso de uso: crear una película.
async function createPelicula(data, dao) {
  const nuevaPelicula = {
    ...data,

    // Guardo la misma representación temporal en ambos DAO.
    fechaProyeccion: new Date(
      data.fechaProyeccion
    ).toISOString(),

    // Al crearla, todos los lugares están disponibles.
    cuposDisponibles: data.capacidadTotal
  };

  return dao.save(nuevaPelicula);
}

export default createPelicula;