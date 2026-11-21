import { z } from "zod";

// Valida el identificador recibido por URL.
const idUsuarioSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Valida los datos para crear usuarios.
const crearUsuarioSchema = z.strictObject({
  nombre: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email()
});

// Permite modificar nombre y/o email.
const actualizarUsuarioSchema = crearUsuarioSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Debe enviar al menos un campo" }
  );

// Los listados todavía no admiten filtros ni paginación.
// Validamos query sin implementar esos opcionales.
const usuarioQuerySchema = z.strictObject({});

export {
  idUsuarioSchema,
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  usuarioQuerySchema
};