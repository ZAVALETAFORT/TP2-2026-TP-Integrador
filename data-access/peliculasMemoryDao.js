class PeliculasMemoryDao {
  #peliculas = []; //Array privado en RAM
  #nextId = 1; //ID autoincremental

  //Metodo para retornar una COPIA del array de peliculas
  async getAll() {
    return [...this.#peliculas];
  }

  async save(data) {
    //Copio el objeto data y le agrego el id autoincremental dentro de pelicula
    const pelicula = { ...data, id: this.#nextId };

    this.#peliculas.push(pelicula); //Agrego la pelicula al array
    this.#nextId += 1; //Incremento el id para la proxima pelicula

    return pelicula;
  }
}

export default PeliculasMemoryDao;
