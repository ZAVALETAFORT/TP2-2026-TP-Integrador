import { Op, literal, UniqueConstraintError } from "sequelize";
import { sequelize, ReservaModel, PeliculaModel } from "./models/index.js";
import AppError from "../errors/AppError.js";

// Convierte el resultado Sequelize a un objeto JavaScript plano.
function toPlain(reserva) {
  return reserva ? reserva.get({ plain: true }) : null;
}

// Evita repetir la validación de cantidades usadas en SQL.
function validarCantidad(cantidad) {
  if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
    throw new AppError(
      "CANTIDAD_INVALIDA",
      "La cantidad debe ser un entero positivo",
      400,
    );
  }
}
class ReservasSequelizeDao {
  // Modifica cupos sin superar la disponibilidad ni la capacidad.
  async #ajustarCupos(peliculaId, diferencia, transaction) {
    const limite =
      diferencia < 0
        ? { [Op.gte]: -diferencia }
        : { [Op.lte]: literal(`"capacidadTotal" - ${diferencia}`) };

    const [afectadas] = await PeliculaModel.update(
      {
        cuposDisponibles: literal(`"cuposDisponibles" + (${diferencia})`),
      },
      {
        where: {
          id: peliculaId,
          cuposDisponibles: limite,
        },
        transaction,
      },
    );

    if (afectadas !== 1) {
      const insuficientes = diferencia < 0;

      throw new AppError(
        insuficientes ? "CUPOS_INSUFICIENTES" : "CUPOS_INCONSISTENTES",
        insuficientes
          ? "No hay suficientes cupos disponibles"
          : "No se pudieron devolver los cupos",
        409,
      );
    }
  }

  // Lista reservas con filtros opcionales.
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

  // Consulta una reserva por su identificador.
  async getById(id) {
    return toPlain(await ReservaModel.findByPk(id));
  }

  // Busca una reserva activa del usuario para una película.
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

  // Guarda la reserva y descuenta cupos en una misma transacción.
  async reservar({ usuarioId, peliculaId, cantidad }) {
    validarCantidad(cantidad);

    let reservaId;

    try {
      reservaId = await sequelize.transaction(async (transaction) => {
        await this.#ajustarCupos(peliculaId, -cantidad, transaction);

        const reserva = await ReservaModel.create(
          {
            usuarioId,
            peliculaId,
            cantidad,
            estado: "activa",
          },
          { transaction },
        );

        return reserva.id;
      });
    } catch (error) {
      // El índice único protege también frente a pedidos simultáneos.
      if (error instanceof UniqueConstraintError) {
        throw new AppError(
          "RESERVA_DUPLICADA",
          "El usuario ya tiene una reserva activa para esta película",
          409,
        );
      }

      throw error;
    }

    return this.getById(reservaId);
  }

  // Ajusta la cantidad y la diferencia de cupos en una transacción.
  async cambiarCantidad(id, cantidad) {
    validarCantidad(cantidad);

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

      await this.#ajustarCupos(reserva.peliculaId, -diferencia, transaction);

      // Evita sobrescribir una reserva modificada por otra operación.
      const [actualizadas] = await ReservaModel.update(
        { cantidad },
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

      return reserva.id;
    });

    return reservaId === null ? null : this.getById(reservaId);
  }

  // Cancela una reserva y devuelve sus cupos una sola vez.
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

      await this.#ajustarCupos(
        reserva.peliculaId,
        reserva.cantidad,
        transaction,
      );

      return reserva.id;
    });

    return reservaId === null ? null : this.getById(reservaId);
  }

  // Elimina la reserva y devuelve cupos si estaba activa.
  async delete(id) {
    return sequelize.transaction(async (transaction) => {
      const reserva = await ReservaModel.findByPk(id, { transaction });

      if (!reserva) return false;

      const eliminadas = await ReservaModel.destroy({
        where: {
          id: reserva.id,
          estado: reserva.estado,
          cantidad: reserva.cantidad,
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

      if (reserva.estado === "activa") {
        await this.#ajustarCupos(
          reserva.peliculaId,
          reserva.cantidad,
          transaction,
        );
      }

      return true;
    });
  }
}

export default new ReservasSequelizeDao();
