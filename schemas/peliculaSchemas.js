import { z } from "zod";

// Validar el ID recibido en la URL.
// Lo convertimos a número entero positivo.
const idPeliculaSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// POST /peliculas

const crearPeliculaSchema = z.strictObject({
  titulo: z.string().trim().min(1),
  fechaProyeccion: z.iso.datetime({ offset: true }),
  capacidadTotal: z.number().int().positive(),
  genero: z.string().trim().min(1).optional(),
  imagenUrl: z.url().optional(),
});

// PUT /peliculas/:id
// Permite modificar uno o varios campos.
const actualizarPeliculaSchema = z
  .strictObject({
    titulo: z.string().trim().min(1).optional(),
    fechaProyeccion: z.iso.datetime({ offset: true }).optional(),
    capacidadTotal: z.number().int().positive().optional(),
    genero: z.string().trim().min(1).optional(),
    imagenUrl: z.url().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo",
  });

export { idPeliculaSchema, crearPeliculaSchema, actualizarPeliculaSchema };
