import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/sequelize.js";

// Modelo Sequelize que representa la tabla peliculas.
class PeliculaModel extends Model {}

PeliculaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    genero: {
      type: DataTypes.STRING,
      allowNull: true
    },

    imagenUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },

    fechaProyeccion: {
      type: DataTypes.DATE,
      allowNull: false
    },

    capacidadTotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },

    cuposDisponibles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    modelName: "Pelicula",
    tableName: "peliculas",
    timestamps: false
  }
);

export default PeliculaModel;