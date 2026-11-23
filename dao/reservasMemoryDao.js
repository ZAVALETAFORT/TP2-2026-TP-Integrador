import AppError from "../errors/AppError.js";

import usuariosMemoryDao from "./usuariosMemoryDao.js";
import peliculasMemoryDao from "./peliculasMemoryDao.js";

class ReservasMemoryDao {
  #reservas = [];
  #nextId = 1;
  #usuariosDao;
  #peliculasDao;

  // Recibe los DAO necesarios para validar entidades y modificar cupos.
  constructor(
    usuariosDao = usuariosMemoryDao,
    peliculasDao = peliculasMemoryDao,
  ) {
    this.#usuariosDao = usuariosDao;
    this.#peliculasDao = peliculasDao;
  }

  // Busca la posición de una reserva dentro del array.
  #findIndexById(id) {
    return this.#reservas.findIndex((reserva) => reserva.id === Number(id));
  }

  // Ajusta cupos y rechaza operaciones que superen la capacidad.
  #ajustarCupos(peliculaId, diferencia) {
    const resultado = this.#peliculasDao.ajustarCupos(peliculaId, diferencia);

    if (resultado === true) return;

    if (resultado === null) {
      throw new AppError(
        "PELICULA_NOT_FOUND",
        "No existe una película con ese ID",
        404,
      );
    }

    const insuficientes = diferencia < 0;

    throw new AppError(
      insuficientes ? "CUPOS_INSUFICIENTES" : "CUPOS_INCONSISTENTES",
      insuficientes
        ? "No hay suficientes cupos disponibles"
        : "No se pudieron devolver los cupos",
      409,
    );
  }

  // Lista reservas aplicando los filtros recibidos.
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

  // Devuelve una reserva por ID o null si no existe.
  async getById(id) {
    const index = this.#findIndexById(id);

    return index === -1 ? null : { ...this.#reservas[index] };
  }

  // Comprueba si el usuario ya tiene activa la misma película.
  async getActive(usuarioId, peliculaId) {
    const reserva = this.#reservas.find(
      (r) =>
        r.usuarioId === Number(usuarioId) &&
        r.peliculaId === Number(peliculaId) &&
        r.estado === "activa",
    );

    return reserva ? { ...reserva } : null;
  }

  // Crea una reserva únicamente si existen las entidades y hay cupos.
  async reservar({ usuarioId, peliculaId, cantidad }) {
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser un entero positivo",
        400,
      );
    }

    const usuario = await this.#usuariosDao.getById(usuarioId);

    if (!usuario) {
      throw new AppError(
        "USUARIO_NOT_FOUND",
        "No existe un usuario con ese ID",
        404,
      );
    }

    const pelicula = await this.#peliculasDao.getById(peliculaId);

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

    // Descuenta y guarda sin await entre ambas operaciones.
    this.#ajustarCupos(peliculaId, -cantidad);

    const reserva = {
      id: this.#nextId++,
      usuarioId: Number(usuarioId),
      peliculaId: Number(peliculaId),
      cantidad,
      estado: "activa",
    };

    this.#reservas.push(reserva);

    return { ...reserva };
  }

  // Cambia la cantidad descontando o devolviendo solo la diferencia.
  async cambiarCantidad(id, cantidad) {
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser un entero positivo",
        400,
      );
    }

    const index = this.#findIndexById(id);

    if (index === -1) return null;

    const reserva = this.#reservas[index];

    if (reserva.estado !== "activa") {
      throw new AppError(
        "RESERVA_NO_ACTIVA",
        "No se puede modificar una reserva cancelada",
        409,
      );
    }

    const diferencia = cantidad - reserva.cantidad;

    if (diferencia !== 0) {
      this.#ajustarCupos(reserva.peliculaId, -diferencia);
      reserva.cantidad = cantidad;
    }

    return { ...reserva };
  }

  // Cancela y devuelve los cupos solamente la primera vez.
  async cancelar(id) {
    const index = this.#findIndexById(id);

    if (index === -1) return null;

    const reserva = this.#reservas[index];

    if (reserva.estado === "cancelada") {
      return { ...reserva };
    }

    this.#ajustarCupos(reserva.peliculaId, reserva.cantidad);

    reserva.estado = "cancelada";

    return { ...reserva };
  }

  // Elimina físicamente la reserva y restituye cupos si estaba activa.
  async delete(id) {
    const index = this.#findIndexById(id);

    if (index === -1) return false;

    const reserva = this.#reservas[index];

    if (reserva.estado === "activa") {
      this.#ajustarCupos(reserva.peliculaId, reserva.cantidad);
    }

    this.#reservas.splice(index, 1);

    return true;
  }
}

export { ReservasMemoryDao };
export default new ReservasMemoryDao();