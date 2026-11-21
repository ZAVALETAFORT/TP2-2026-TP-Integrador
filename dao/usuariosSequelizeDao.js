import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";

import { UsuarioModel } from "./models/index.js";
import AppError from "../errors/AppError.js";

// Normaliza la representación de usuarios entre SQLite y memoria.
function toPlain(usuario) {
  if (!usuario) return null;

  const data = usuario.get({ plain: true });

  return {
    ...data,
    passwordHash: data.passwordHash ?? null
  };
}

class UsuariosSequelizeDao {
  // Listar usuarios.
  async getAll() {
    const usuarios = await UsuarioModel.findAll({
      order: [["id", "ASC"]],
    });

    return usuarios.map(toPlain);
  }

  // Buscar por identificador.
  async getById(id) {
    const usuario = await UsuarioModel.findByPk(id);

    return toPlain(usuario);
  }

  // Buscar por email
  async getByEmail(email) {
    const usuario = await UsuarioModel.findOne({
      where: { email },
    });

    return toPlain(usuario);
  }

  // Crear usuario.
  async save(data) {
    try {
      const usuario = await UsuarioModel.create(data);

      return toPlain(usuario);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          "EMAIL_DUPLICATED",
          "El email ya está registrado",
          409,
        );
      }

      throw error;
    }
  }

  // Actualizar usuario.
  async update(id, changes) {
    const usuario = await UsuarioModel.findByPk(id);

    if (!usuario) return null;

    try {
      await usuario.update(changes);

      return toPlain(usuario);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          "EMAIL_DUPLICATED",
          "El email ya está registrado",
          409,
        );
      }

      throw error;
    }
  }

  // Eliminar usuario.
  async delete(id) {
    try {
      const eliminados = await UsuarioModel.destroy({
        where: { id },
      });

      return eliminados > 0;
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new AppError(
          "USUARIO_CON_RESERVAS",
          "No se puede eliminar un usuario con reservas",
          409,
        );
      }

      throw error;
    }
  }
}

export default new UsuariosSequelizeDao();
