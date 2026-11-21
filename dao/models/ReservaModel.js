import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/sequelize.js";

// Tabla intermedia entre usuarios y peliculas.
// Relacion N:N mediante las columnas usuarioId y peliculaId
class ReservaModel extends Model {}

ReservaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    peliculaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },

    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "activa",
      validate: {
        isIn: [["activa", "cancelada"]]
      }
    }
  },
  {
    sequelize,
    modelName: "Reserva",
    tableName: "reservas",
    timestamps: false,

    // No permite dos reservas activas del mismo usuario
    // para la misma pelicula.
    indexes: [
      {
        name: "uq_reserva_activa",
        unique: true,
        fields: ["usuarioId", "peliculaId"],
        where: {
          estado: "activa"
        }
      }
    ]
  }
);

export default ReservaModel;