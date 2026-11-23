import getPeliculas from "./getPeliculas.js";
import getPeliculaById from "./getPeliculaById.js";
import createPelicula from "./createPelicula.js";
import updatePelicula from "./updatePelicula.js";
import deletePelicula from "./deletePelicula.js";

// Vincula los casos de uso de Películas con sus dependencias.
function makePeliculaUseCases(dao, reservasDao) {
  return {

    getPeliculas: () => getPeliculas(dao),
    getPeliculaById: (id) => getPeliculaById(id, dao),
    createPelicula: (data) => createPelicula(data, dao),
    updatePelicula: (id, changes) => updatePelicula(id, changes, dao),
    deletePelicula: (id) => deletePelicula(id, dao, reservasDao),
  };
}
export default makePeliculaUseCases;
