import getPeliculas from "./getPeliculas.js";
import getPeliculaById from "./getPeliculaById.js";
import createPelicula from "./createPelicula.js";
import updatePelicula from "./updatePelicula.js";
import deletePelicula from "./deletePelicula.js";

//Factory: Conecto el DAO con los useCases 
function makePeliculaUseCases(dao) {
  return {
    getPeliculas: () => getPeliculas(dao),
    getPeliculaById: (id) => getPeliculaById(id,dao),
    createPelicula: (data) => createPelicula(data, dao),
    updatePelicula: (id, changes) => updatePelicula(id, changes, dao),
    deletePelicula: (id) => deletePelicula(id,dao)
  };
}

export default makePeliculaUseCases;