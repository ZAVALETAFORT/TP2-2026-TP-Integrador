import { Op, literal, UniqueConstraintError } from "sequelize";

import {
  sequelize,
  ReservaModel,
  UsuarioModel,
  PeliculaModel,
} from "./models/index.js";

import AppError from "../errors/AppError.js";

// Convierte el resultado de Sequelize en un objeto JavaScript plano.
function toPlain(reserva) {
  return reserva ? reserva.get({ plain: true }) : null;
}

class ReservasSequelizeDao {
  // Lista reservas aplicando filtros opcionales.
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

  // Consulta una reserva por ID.
  async getById(id) {
    return toPlain(await ReservaModel.findByPk(id));
  }

  // Busca una reserva activa de un usuario para una película.
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

  // Confirma la reserva y descuenta los cupos en una transacción.
  async reservar({ usuarioId, peliculaId, cantidad }) {
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
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

        // Descuenta solamente cuando hay suficientes lugares.
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

        if (afectadas !== 1) {
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

  // Modifica la cantidad y ajusta la diferencia de cupos en una transacción.
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

      // Al aumentar exige cupos; al reducir no supera la capacidad.
      const condicionCupos =
        diferencia > 0
          ? { [Op.gte]: diferencia }
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

      if (afectadas !== 1) {
        throw new AppError(
          diferencia > 0 ? "CUPOS_INSUFICIENTES" : "CUPOS_INCONSISTENTES",
          diferencia > 0
            ? "No hay suficientes cupos disponibles"
            : "No se pudieron devolver los cupos",
          409,
        );
      }

      // Evita modificar una reserva cuyos datos ya cambiaron.
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

    return reservaId === null ? null : this.getById(reservaId);
  }

  // Cancela y devuelve los cupos una sola vez mediante una transacción.
  async cancelar(id) {
    const reservaId = await sequelize.transaction(async (transaction) => {
      const reserva = await ReservaModel.findByPk(id, { transaction });

      if (!reserva) return null;

      if (reserva.estado === "cancelada") {
        return reserva.id;
      }

      const [actualizadas] = await ReservaModel.update(
        { estado: "cancelada" },
        {
          where: {
            id: reserva.id,
            estado: "activa",
            cantidad: reserva.cantidad,
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

      // Devuelve lugares solo si no supera la capacidad.
      const [devueltas] = await PeliculaModel.update(
        {
          cuposDisponibles: literal(`"cuposDisponibles" + ${reserva.cantidad}`),
        },
        {
          where: {
            id: reserva.peliculaId,
            cuposDisponibles: {
              [Op.lte]: literal(`"capacidadTotal" - ${reserva.cantidad}`),
            },
          },
          transaction,
        },
      );

      if (devueltas !== 1) {
        throw new AppError(
          "CUPOS_INCONSISTENTES",
          "No se pudieron devolver los cupos",
          409,
        );
      }

      return reserva.id;
    });

    return reservaId === null ? null : this.getById(reservaId);
  }

  // Elimina y devuelve cupos únicamente si la reserva estaba activa.
  async delete(id) {
    return sequelize.transaction(async (transaction) => {
      const reserva = await ReservaModel.findByPk(id, { transaction });

      if (!reserva) return false;

      if (reserva.estado === "activa") {
        const [devueltas] = await PeliculaModel.update(
          {
            cuposDisponibles: literal(
              `"cuposDisponibles" + ${reserva.cantidad}`,
            ),
          },
          {
            where: {
              id: reserva.peliculaId,
              cuposDisponibles: {
                [Op.lte]: literal(`"capacidadTotal" - ${reserva.cantidad}`),
              },
            },
            transaction,
          },
        );

        if (devueltas !== 1) {
          throw new AppError(
            "CUPOS_INCONSISTENTES",
            "No se pudieron devolver los cupos",
            409,
          );
        }
      }

      // Elimina solo si la reserva conserva su cantidad y estado.
      const eliminadas = await ReservaModel.destroy({
        where: {
          id: reserva.id,
          cantidad: reserva.cantidad,
          estado: reserva.estado,
        },
        transaction,
      });

      if (eliminadas !== 1) {
        throw new AppError(
          "RESERVA_MODIFICADA",
          "La reserva fue modificada por otra operación",
          409,
        );
      }

      return true;
    });
  }
}

export default new ReservasSequelizeDao();