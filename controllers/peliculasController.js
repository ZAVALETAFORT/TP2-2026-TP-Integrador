import AppError from "../errors/AppError.js";

// Controller de películas.
// Recibe los casos de uso desde el Container.
class PeliculasController {

  #useCases;

  // Inyección de dependencias.
  constructor(useCases) {
    this.#useCases = useCases;
  }

  // GET /peliculas
  // Devuelve todas las películas.
  list = async (req, res) => {

    const peliculas = await this.#useCases.getPeliculas();

    res.json(peliculas);
  };

  // GET /peliculas/:id
  // Busca una película por ID.
  get = async (req, res) => {

    const pelicula = await this.#useCases.getPeliculaById(
      req.params.id
    );

    // El caso de uso devuelve null si no existe.
    // El Controller lo convierte en HTTP 404.
    if (!pelicula) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404
      );
    }

    res.json(pelicula);
  };

  // POST /peliculas
  // Crea una película.
  create = async (req, res) => {

    const pelicula = await this.#useCases.createPelicula(
      req.body
    );

    res.status(201).json(pelicula);
  };

  // PUT /peliculas/:id
  // Actualiza una película.
  update = async (req, res) => {

    const pelicula = await this.#useCases.updatePelicula(
      req.params.id,
      req.body
    );

    if (!pelicula) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404
      );
    }

    res.json(pelicula);
  };

  // DELETE /peliculas/:id
  // Elimina una película.
  remove = async (req, res) => {

    const eliminado = await this.#useCases.deletePelicula(
      req.params.id
    );

    if (!eliminado) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404
      );
    }

    res.status(204).send();
  };
}

export default PeliculasController;