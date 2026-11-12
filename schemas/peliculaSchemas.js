import {z } from 'zod';

//Esquema para validar datos de pelicula
const crearPeliculaSchema = z.object({
    
    titulo: z.string().trim().min(1), //Texto, saco espacios con trim, un char minimo
    fechaProyeccion: z.iso.datetime({ offset: true }), //fecha con ISO y zona horaria
    capacidadTotal: z.number().int().positive(), //Numero entero positivo
    genero: z.string().trim().min(1).optional(), //String minimo 1 y es opcional
    imagenUrl: z.url().optional()

} )

export {crearPeliculaSchema};