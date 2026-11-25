import { z } from "zod";

// Valida y convierte el ID recibido en la URL.
const idReservaSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Exige usuario, película y cantidad válida para crear una reserva.
const crearReservaSchema = z.strictObject({
  usuarioId: z.number().int().positive().optional(), //Lo saco del token
  peliculaId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
});

// Permite cambiar cantidad o cancelar, pero no ambas operaciones juntas.
const actualizarReservaSchema = z
  .strictObject({
    cantidad: z.number().int().positive().optional(),
    estado: z.literal("cancelada").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo",
  })
  .refine(
    (data) => !(data.estado === "cancelada" && data.cantidad !== undefined),
    {
      message: "Cancelá o cambiá la cantidad en operaciones separadas",
    },
  );

// Permite filtrar el listado por usuario, película o estado.
const reservaQuerySchema = z.strictObject({
  usuarioId: z.coerce.number().int().positive().optional(),
  peliculaId: z.coerce.number().int().positive().optional(),
  estado: z.enum(["activa", "cancelada"]).optional(),
});

export {
  idReservaSchema,
  crearReservaSchema,
  actualizarReservaSchema,
  reservaQuerySchema,
};
