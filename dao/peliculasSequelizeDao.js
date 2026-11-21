import { ForeignKeyConstraintError } from "sequelize";

import { PeliculaModel } from "./models/index.js";
import AppError from "../errors/AppError.js";

// Convierte un modelo Sequelize en un objeto JavaScript.
function toPlain(pelicula) {
  if (!pelicula) return null;

  const data = pelicula.get({ plain: true });

  // Unificamos el formato de fecha con el DAO Memory.
  data.fechaProyeccion = new Date(
    data.fechaProyeccion
  ).toISOString();

  // Los campos opcionales ausentes no se devuelven.
  if (data.genero == null) delete data.genero;
  if (data.imagenUrl == null) delete data.imagenUrl;

  return data;
}

class PeliculasSequelizeDao {

  // GET: listar películas.
  async getAll() {
    const peliculas = await PeliculaModel.findAll({
      order: [["id", "ASC"]]
    });

    return peliculas.map(toPlain);
  }

  // GET: obtener una película por ID.
  async getById(id) {
    const pelicula = await PeliculaModel.findByPk(id);

    return toPlain(pelicula);
  }

  // POST: guardar una película.
  async save(data) {
    const pelicula = await PeliculaModel.create(data);

    return toPlain(pelicula);
  }

  // PUT: actualizar una película.
  async update(id, changes) {
    const pelicula = await PeliculaModel.findByPk(id);

    if (!pelicula) return null;

    await pelicula.update(changes);

    return toPlain(pelicula);
  }

  // DELETE: eliminar una película.
  async delete(id) {
    try {
      const eliminados = await PeliculaModel.destroy({
        where: { id }
      });

      return eliminados > 0;

    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new AppError(
          "PELICULA_CON_RESERVAS",
          "No se puede eliminar una película con reservas",
          409
        );
      }

      throw error;
    }
  }
}

export default new PeliculasSequelizeDao();