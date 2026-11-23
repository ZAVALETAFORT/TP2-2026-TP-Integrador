import { Op, literal, UniqueConstraintError } from "sequelize";

import {
  sequelize,
  ReservaModel,
  UsuarioModel,
  PeliculaModel,
} from "./models/index.js";

import AppError from "../errors/AppError.js";

function toPlain(reserva) {
  if (!reserva) return null;

  return reserva.get({ plain: true });
}

class ReservasSequelizeDao {
  async getAll({ usuarioId, peliculaId, estado } = {}) {
    const where = {};

    if (usuarioId !== undefined) {
      where.usuarioId = Number(usuarioId);
    }

    if (peliculaId !== undefined) {
      where.peliculaId = Number(peliculaId);
    }

    if (estado !== undefined) {
      where.estado = estado;
    }

    const reservas = await ReservaModel.findAll({
      where,
      order: [["id", "ASC"]],
    });

    return reservas.map(toPlain);
  }

  async getById(id) {
    const reserva = await ReservaModel.findByPk(id);

    return toPlain(reserva);
  }

  async getActive(usuarioId, peliculaId) {
    const reserva = await ReservaModel.findOne({
      where: {
        usuarioId: Number(usuarioId),
        peliculaId: Number(peliculaId),
        estado: "activa",
      },
    });

    return toPlain(reserva);
  }

  // Guardado básico, sin modificar cupos.
  async save(data) {
    try {
      const reserva = await ReservaModel.create({
        usuarioId: Number(data.usuarioId),
        peliculaId: Number(data.peliculaId),
        cantidad: data.cantidad,
        estado: data.estado ?? "activa",
      });

      return toPlain(reserva);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          "RESERVA_DUPLICADA",
          "El usuario ya tiene una reserva activa para esta película",
          409,
        );
      }

      throw error;
    }
  }

  // Descuenta cupos y crea la reserva dentro de una transacción.
  async reservar({ usuarioId, peliculaId, cantidad }) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser un entero positivo",
        400,
      );
    }

    try {
      const reservaId = await sequelize.transaction(async (transaction) => {
        const usuario = await UsuarioModel.findByPk(usuarioId, { transaction });

        if (!usuario) {
          throw new AppError(
            "USUARIO_NOT_FOUND",
            "No existe un usuario con ese ID",
            404,
          );
        }

        const pelicula = await PeliculaModel.findByPk(peliculaId, {
          transaction,
        });

        if (!pelicula) {
          throw new AppError(
            "PELICULA_NOT_FOUND",
            "No existe una película con ese ID",
            404,
          );
        }

        const existente = await ReservaModel.findOne({
          where: {
            usuarioId: Number(usuarioId),
            peliculaId: Number(peliculaId),
            estado: "activa",
          },
          transaction,
        });

        if (existente) {
          throw new AppError(
            "RESERVA_DUPLICADA",
            "El usuario ya tiene una reserva activa para esta película",
            409,
          );
        }

        // El UPDATE condicional impide descontar más cupos de los disponibles.
        const [afectadas] = await PeliculaModel.update(
          {
            cuposDisponibles: literal(`"cuposDisponibles" - ${cantidad}`),
          },
          {
            where: {
              id: Number(peliculaId),
              cuposDisponibles: {
                [Op.gte]: cantidad,
              },
            },
            transaction,
          },
        );

        if (afectadas === 0) {
          throw new AppError(
            "CUPOS_INSUFICIENTES",
            "No hay suficientes cupos disponibles",
            409,
          );
        }

        const reserva = await ReservaModel.create(
          {
            usuarioId: Number(usuarioId),
            peliculaId: Number(peliculaId),
            cantidad,
            estado: "activa",
          },
          { transaction },
        );

        return reserva.id;
      });

      return this.getById(reservaId);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          "RESERVA_DUPLICADA",
          "El usuario ya tiene una reserva activa para esta película",
          409,
        );
      }

      throw error;
    }
  }

  // Cambia la cantidad y ajusta los cupos en una sola transacción.
  async cambiarCantidad(id, cantidad) {
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser un entero positivo",
        400,
      );
    }

    const reservaId = await sequelize.transaction(async (transaction) => {
      const reserva = await ReservaModel.findByPk(id, { transaction });

      if (!reserva) return null;

      if (reserva.estado !== "activa") {
        throw new AppError(
          "RESERVA_NO_ACTIVA",
          "No se puede modificar una reserva cancelada",
          409,
        );
      }

      if (reserva.cantidad === cantidad) {
        return reserva.id;
      }

      const diferencia = cantidad - reserva.cantidad;

      // Al aumentar, exige cupos suficientes; al reducir, evita superar capacidad.
      const condicionCupos =
        diferencia > 0
          ? {
              [Op.gte]: diferencia,
            }
          : {
              [Op.lte]: literal(`"capacidadTotal" - ${-diferencia}`),
            };

      const [afectadas] = await PeliculaModel.update(
        {
          cuposDisponibles: literal(`"cuposDisponibles" - (${diferencia})`),
        },
        {
          where: {
            id: reserva.peliculaId,
            cuposDisponibles: condicionCupos,
          },
          transaction,
        },
      );

      if (afectadas === 0) {
        throw new AppError(
          diferencia > 0 ? "CUPOS_INSUFICIENTES" : "CUPOS_INCONSISTENTES",
          diferencia > 0
            ? "No hay suficientes cupos disponibles"
            : "No se pueden devolver los cupos solicitados",
          409,
        );
      }

      // Solo actualiza si la cantidad anterior y el estado siguen iguales.
      const [actualizadas] = await ReservaModel.update(
        { cantidad },
        {
          where: {
            id: reserva.id,
            cantidad: reserva.cantidad,
            estado: "activa",
          },
          transaction,
        },
      );

      if (actualizadas !== 1) {
        throw new AppError(
          "RESERVA_MODIFICADA",
          "La reserva fue modificada por otra operación",
          409,
        );
      }

      return reserva.id;
    });

    if (reservaId === null) return null;

    return this.getById(reservaId);
  }

  // Actualización básica; no coordina cupos.
  async update(id, changes) {
    const reserva = await ReservaModel.findByPk(id);

    if (!reserva) return null;

    const cambios = {};

    if (changes.cantidad !== undefined) {
      cambios.cantidad = changes.cantidad;
    }

    if (changes.estado !== undefined) {
      cambios.estado = changes.estado;
    }

    try {
      await reserva.update(cambios);

      return toPlain(reserva);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          "RESERVA_DUPLICADA",
          "El usuario ya tiene una reserva activa para esta película",
          409,
        );
      }

      throw error;
    }
  }

  // Eliminación básica; no coordina cupos.
  async delete(id) {
    const eliminadas = await ReservaModel.destroy({
      where: { id: Number(id) },
    });

    return eliminadas > 0;
  }
}

export default new ReservasSequelizeDao();

//lLEGUE HASTA FASE 3.3a Modificar cantidad	Pendiente de ejecutar QA