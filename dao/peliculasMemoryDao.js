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

  // Buscar por ID
  async getById(id) {

    return this.#peliculas.find(
      (pelicula) => pelicula.id === Number(id)) ?? null; //Null si no la encuentra
  }

  // Actualizar por ID
  async update(id, changes) {
    const index = this.#peliculas.findIndex( //Busca por index
      (pelicula) => pelicula.id === Number(id));

    if (index === -1) return null; //Si no la encuentra, retorna null 

    //Si la encuentra, actualiza la pelicula con los cambios
    this.#peliculas[index] = { ...this.#peliculas[index], ...changes };
    
    return this.#peliculas[index]; //Retorna la pelicula actualizada
  }

  // Borrar por ID
  async delete(id) {
    const index = this.#peliculas.findIndex( //Busca por index
      (pelicula) => pelicula.id === Number(id));

    if (index === -1) return false; //Si no la encuentra, retorna false

    this.#peliculas.splice(index, 1); //Si la encuentra, la borra del array

    return true; //Retorna true si la borra
  }

}

export default new PeliculasMemoryDao();
