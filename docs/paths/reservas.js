import { operation, ref, arrayOf, json } from "../operation.js";

import {
  idReservaSchema,
  crearReservaSchema,
  actualizarReservaSchema,
  reservaQuerySchema,
} from "../../schemas/reservaSchemas.js";

const tag = "Reservas";

export default {
  "/reservas": {
    get: operation({
      tag,
      id: "getReservas",
      summary: "Listar reservas",
      query: reservaQuerySchema,
      responses: {
        200: json("Reservas filtradas", arrayOf("Reserva")),
      },
    }),

    post: operation({
      tag,
      id: "createReserva",
      summary: "Crear reserva y descontar cupos",
      description: "Si se confirma, emite el evento reserva.creada.",
      body: crearReservaSchema,
      bodyExample: {
        usuarioId: 1,
        peliculaId: 1,
        cantidad: 2,
      },
      responses: {
        201: json("Reserva creada", ref("Reserva")),
      },
      errors: [
        "CANTIDAD_INVALIDA",
        "USUARIO_NOT_FOUND",
        "PELICULA_NOT_FOUND",
        "RESERVA_DUPLICADA",
        "CUPOS_INSUFICIENTES",
      ],
    }),
  },

  "/reservas/{id}": {
    get: operation({
      tag,
      id: "getReserva",
      summary: "Consultar reserva",
      params: idReservaSchema,
      responses: {
        200: json("Reserva", ref("Reserva")),
      },
      errors: ["RESERVA_NOT_FOUND"],
    }),

    put: operation({
      tag,
      id: "updateReserva",
      summary: "Cambiar cantidad o cancelar reserva",
      description:
        "Enviar solo cantidad o estado=cancelada, no ambas propiedades.",
      params: idReservaSchema,
      body: actualizarReservaSchema,
      bodyExample: { cantidad: 1 },
      responses: {
        200: json("Reserva actualizada", ref("Reserva")),
      },
      errors: [
        "RESERVA_NOT_FOUND",
        "RESERVA_NO_ACTIVA",
        "CUPOS_INSUFICIENTES",
        "CUPOS_INCONSISTENTES",
        "RESERVA_MODIFICADA",
        "CANTIDAD_INVALIDA",
      ],
    }),

    delete: operation({
      tag,
      id: "deleteReserva",
      summary: "Eliminar reserva y devolver cupos si estaba activa",
      params: idReservaSchema,
      responses: {
        204: { description: "Eliminada, sin cuerpo" },
      },
      errors: [
        "RESERVA_NOT_FOUND",
        "CUPOS_INCONSISTENTES",
        "RESERVA_MODIFICADA",
      ],
    }),
  },
};