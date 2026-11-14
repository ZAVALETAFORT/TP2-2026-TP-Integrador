import dao from "../dao/peliculasMemoryDao.js";
import AppError from "../errors/AppError.js";

import createPelicula from "../usecases/peliculas/createPelicula.js";
import getPeliculas from "../usecases/peliculas/getPeliculas.js";
import getPeliculaById from "../usecases/peliculas/getPeliculaById.js";
import updatePelicula from "../usecases/peliculas/updatePelicula.js";
import deletePelicula from "../usecases/peliculas/deletePelicula.js";

class PeliculasController {
  #dao;

  //Recibo DAO por inyeccion de dependencias, para poder cambiarlo facilmente (Memory, SQL, etc)
  constructor(daoDependencia) {
    this.#dao = daoDependencia;
  }

  //GET /peliculas
  list = async (req, res) => {
    const peliculas = await getPeliculas(this.#dao);

    res.json(peliculas);
  };

  //POST /peliculas
  create = async (req, res) => {
    const nuevaPelicula = await createPelicula(req.body, this.#dao);
    //HTTP 201 indica que se creo un recurso nuevo
    res.status(201).json(nuevaPelicula);
  };

  // GET /peliculas/:id
  get = async (req, res) => {
    const pelicula = await getPeliculaById(req.params.id, this.#dao);

    // El DAO informa ausencia con null; el Controller responde 404.
    if (!pelicula) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    res.json(pelicula);
  };

  // PUT /peliculas/:id
  update = async (req, res) => {
    // El Use Case comprueba existencia y reglas de capacidad.
    const pelicula = await updatePelicula(req.params.id, req.body, this.#dao);

    if (!pelicula) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    res.json(pelicula);
  };

  // DELETE /peliculas/:id
  remove = async (req, res) => {
    const deleted = await deletePelicula(req.params.id, this.#dao);

    // Si el DAO devuelve false, no había nada para eliminar.
    if (!deleted) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    // Eliminación exitosa: 204 sin contenido.
    res.status(204).send();
  };

}

export default new PeliculasController(dao);
