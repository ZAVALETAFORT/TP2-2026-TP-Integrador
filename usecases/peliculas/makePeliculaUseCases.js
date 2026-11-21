import getPeliculas from "./getPeliculas";
import getPeliculaById from "./getPeliculaById";
import createPelicula from "./createPelicula";
import updatePelicula from "./updatePelicula";
import deletePelicula from "./deletePelicula";

//Factory: Conecto el DAO con los useCases 
function makePeliculaUseCases(dao) {
  return {
    getPeliculas: () => getPeliculas(dao),
    getPeliculaById: (id) => getPeliculaById(dao, id),
    createPelicula: (pelicula) => createPelicula(dao, pelicula),
    updatePelicula: (id, pelicula) => updatePelicula(dao, id, pelicula),
    deletePelicula: (id) => deletePelicula(dao, id)
  };
}

export default makePeliculaUseCases;