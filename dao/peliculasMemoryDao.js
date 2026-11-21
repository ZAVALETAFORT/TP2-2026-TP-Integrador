class PeliculasMemoryDao {
  
  #peliculas = [];
  #nextId = 1;

  // Listar películas.
  async getAll() {
    return this.#peliculas.map((pelicula) => ({ ...pelicula }));
  }

  // Guardar película.
  async save(data) {
    const pelicula = {
      ...data,
      id: this.#nextId,
    };

    this.#peliculas.push(pelicula);
    this.#nextId += 1;

    return { ...pelicula };
  }

  // Buscar posición por ID.
  #findIndexById(id) {
    return this.#peliculas.findIndex((pelicula) => pelicula.id === Number(id));
  }

  // Consultar película.
  async getById(id) {
    const index = this.#findIndexById(id);

    if (index === -1) return null;

    return { ...this.#peliculas[index] };
  }

  // Actualizar película.
  async update(id, changes) {
    const index = this.#findIndexById(id);

    if (index === -1) return null;

    this.#peliculas[index] = {
      ...this.#peliculas[index],
      ...changes,
      id: this.#peliculas[index].id,
    };

    return { ...this.#peliculas[index] };
  }

  // Eliminar película.
  async delete(id) {
    const index = this.#findIndexById(id);

    if (index === -1) return false;

    this.#peliculas.splice(index, 1);

    return true;
  }
}

export default new PeliculasMemoryDao();