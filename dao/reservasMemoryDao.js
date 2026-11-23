import AppError from "../errors/AppError.js";

import usuariosMemoryDao from "./usuariosMemoryDao.js";
import peliculasMemoryDao from "./peliculasMemoryDao.js";

class ReservasMemoryDao {
  #reservas = [];
  #nextId = 1;

  async getAll({ usuarioId, peliculaId, estado } = {}) {
    return this.#reservas
      .filter(
        (reserva) =>
          (usuarioId === undefined ||
            reserva.usuarioId === Number(usuarioId)) &&
          (peliculaId === undefined ||
            reserva.peliculaId === Number(peliculaId)) &&
          (estado === undefined || reserva.estado === estado),
      )
      .map((reserva) => ({ ...reserva }));
  }

  async getById(id) {
    const reserva = this.#reservas.find((r) => r.id === Number(id));

    return reserva ? { ...reserva } : null;
  }

  async getActive(usuarioId, peliculaId) {
    const reserva = this.#reservas.find(
      (r) =>
        r.usuarioId === Number(usuarioId) &&
        r.peliculaId === Number(peliculaId) &&
        r.estado === "activa",
    );

    return reserva ? { ...reserva } : null;
  }

  // Guardado básico, sin modificar cupos.
  async save(data) {
    if (data.estado === undefined || data.estado === "activa") {
      const existente = await this.getActive(data.usuarioId, data.peliculaId);

      if (existente) {
        throw new AppError(
          "RESERVA_DUPLICADA",
          "El usuario ya tiene una reserva activa para esta película",
          409,
        );
      }
    }

    const reserva = {
      id: this.#nextId,
      usuarioId: Number(data.usuarioId),
      peliculaId: Number(data.peliculaId),
      cantidad: data.cantidad,
      estado: data.estado ?? "activa",
    };

    this.#reservas.push(reserva);
    this.#nextId += 1;

    return { ...reserva };
  }

  // Comprueba cupos y guarda la reserva sin ceder la ejecución.
  async reservar({ usuarioId, peliculaId, cantidad }) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser un entero positivo",
        400,
      );
    }

    const usuario = await usuariosMemoryDao.getById(usuarioId);

    if (!usuario) {
      throw new AppError(
        "USUARIO_NOT_FOUND",
        "No existe un usuario con ese ID",
        404,
      );
    }

    const pelicula = await peliculasMemoryDao.getById(peliculaId);

    if (!pelicula) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    const duplicada = this.#reservas.some(
      (r) =>
        r.usuarioId === Number(usuarioId) &&
        r.peliculaId === Number(peliculaId) &&
        r.estado === "activa",
    );

    if (duplicada) {
      throw new AppError(
        "RESERVA_DUPLICADA",
        "El usuario ya tiene una reserva activa para esta película",
        409,
      );
    }

    const descontado = peliculasMemoryDao.ajustarCupos(peliculaId, -cantidad);

    if (descontado === null) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    if (!descontado) {
      throw new AppError(
        "CUPOS_INSUFICIENTES",
        "No hay suficientes cupos disponibles",
        409,
      );
    }

    const reserva = {
      id: this.#nextId,
      usuarioId: Number(usuarioId),
      peliculaId: Number(peliculaId),
      cantidad,
      estado: "activa",
    };

    this.#reservas.push(reserva);
    this.#nextId += 1;

    return { ...reserva };
  }

  // Ajusta solo la diferencia: positiva descuenta, negativa devuelve cupos.
  async cambiarCantidad(id, cantidad) {
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser un entero positivo",
        400,
      );
    }

    const index = this.#reservas.findIndex((r) => r.id === Number(id));

    if (index === -1) return null;

    const reserva = this.#reservas[index];

    if (reserva.estado !== "activa") {
      throw new AppError(
        "RESERVA_NO_ACTIVA",
        "No se puede modificar una reserva cancelada",
        409,
      );
    }

    if (reserva.cantidad === cantidad) {
      return { ...reserva };
    }

    const diferencia = cantidad - reserva.cantidad;

    // El ajuste y la modificación se completan sin await.
    const ajustado = peliculasMemoryDao.ajustarCupos(
      reserva.peliculaId,
      -diferencia,
    );

    if (ajustado === null) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    if (!ajustado) {
      throw new AppError(
        diferencia > 0 ? "CUPOS_INSUFICIENTES" : "CUPOS_INCONSISTENTES",
        diferencia > 0
          ? "No hay suficientes cupos disponibles"
          : "No se pueden devolver los cupos solicitados",
        409,
      );
    }

    reserva.cantidad = cantidad;

    return { ...reserva };
  }

  // Actualizacion básica, sin coordinar cupos.
  async update(id, changes) {
    const index = this.#reservas.findIndex((r) => r.id === Number(id));

    if (index === -1) return null;

    const actual = this.#reservas[index];

    if (changes.estado === "activa" && actual.estado !== "activa") {
      const existente = await this.getActive(
        actual.usuarioId,
        actual.peliculaId,
      );

      if (existente) {
        throw new AppError(
          "RESERVA_DUPLICADA",
          "El usuario ya tiene una reserva activa para esta película",
          409,
        );
      }
    }

    const reservaActualizada = {
      ...actual,
      cantidad: changes.cantidad ?? actual.cantidad,
      estado: changes.estado ?? actual.estado,
    };

    this.#reservas[index] = reservaActualizada;

    return { ...reservaActualizada };
  }

  // Eliminación básica, no coordina cupos.
  async delete(id) {
    const index = this.#reservas.findIndex((r) => r.id === Number(id));

    if (index === -1) return false;

    this.#reservas.splice(index, 1);

    return true;
  }
}

export default new ReservasMemoryDao();