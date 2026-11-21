import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/sequelize.js";

// Modelo Sequelize que representa la tabla usuarios.
class UsuarioModel extends Model {}

UsuarioModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true
    },

    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "cliente",
      validate: {
        isIn: [["cliente", "admin"]]
      }
    }
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuarios",
    timestamps: false
  }
);

export default UsuarioModel;