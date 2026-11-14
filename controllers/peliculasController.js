import dao from "../daopeliculasMemoryDao.js";
import createPelicula from "../usecases/peliculas/createPelicula.js";
import getPeliculas from "../usecases/peliculas/getPeliculas.js";

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
}

export default new PeliculasController(dao);
