import { z } from "zod";

// Esquemas para las respuestas de la API.
const id = z.number().int().positive();

const Usuario = z.strictObject({
  id,
  nombre: z.string(),
  email: z.email(),
  rol: z.enum(["cliente", "admin"]),
});

const Pelicula = z.strictObject({
  id,
  titulo: z.string(),
  fechaProyeccion: z.iso.datetime(),
  capacidadTotal: z.number().int().positive(),
  cuposDisponibles: z.number().int().min(0),
  genero: z.string().optional(),
  imagenUrl: z.url().optional(),
});

const Reserva = z.strictObject({
  id,
  usuarioId: id,
  peliculaId: id,
  cantidad: z.number().int().positive(),
  estado: z.enum(["activa", "cancelada"]),
});

const Health = z.strictObject({
  status: z.string(),
});

const ErrorResponse = z.strictObject({
  error: z.strictObject({
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  }),
});

export { Usuario, Pelicula, Reserva, Health, ErrorResponse };
