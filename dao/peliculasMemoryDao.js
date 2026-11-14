class PeliculasMemoryDao {
  #peliculas = []; //Array privado en RAM
  #nextId = 1; //ID autoincremental

  // Listar
  async getAll() {
    //Retorno una COPIA del array de peliculas
    return [...this.#peliculas];
  }
  // Guardar
  async save(data) {
    //Copio el objeto data y le agrego el id autoincremental dentro de pelicula
    const pelicula = { ...data, id: this.#nextId };

    this.#peliculas.push(pelicula); //Agrego la pelicula al array
    this.#nextId += 1; //Incremento el id para la proxima pelicula

    return pelicula;
  }

  // Busca la posición de una película por ID.
  // Devuelve -1 si no existe.
  #findIndexById(id) {
    return this.#peliculas.findIndex((pelicula) => pelicula.id === Number(id));
  }

  // Obtiene la película utilizando su posición.
  async getById(id) {
    const index = this.#findIndexById(id);

    if (index === -1) return null;

    return this.#peliculas[index];
  }

  // Modifica los campos recibidos sin perder los anteriores.
  // Conserva siempre el ID original.
  async update(id, changes) {
    const index = this.#findIndexById(id);

    if (index === -1) return null;

    this.#peliculas[index] = {
      ...this.#peliculas[index],
      ...changes,
      id: this.#peliculas[index].id,
    };

    return this.#peliculas[index];
  }

  // Elimina una película del array.
  async delete(id) {
    const index = this.#findIndexById(id);

    if (index === -1) return false;

    this.#peliculas.splice(index, 1);

    return true;
  }
}

export default new PeliculasMemoryDao();
