import {z } from 'zod';
//Esquema para validar datos JSON de pelicula

// Validamos el objeto req.params y convertimos su ID a numero entero positivo
const idPeliculaSchema = z.object({
    
    id: z.coerce.number().int().positive()

});

//Validar al crear 
const crearPeliculaSchema = z.object({
    
    titulo: z.string().trim().min(1), //Texto, saco espacios con trim, un char minimo
    fechaProyeccion: z.iso.datetime({ offset: true }), //fecha con ISO y zona horaria
    capacidadTotal: z.number().int().positive(), //Numero entero positivo
    genero: z.string().trim().min(1).optional(), //String minimo 1 y es opcional
    imagenUrl: z.url().optional()

});

// PUT: Validar al actualizar
const actualizarPeliculaSchema = z.object({

    titulo: z.string().trim().min(1).optional(),
    fechaProyeccion: z.iso.datetime({ offset: true }).optional(),
    capacidadTotal: z.number().int().positive().optional(), 
    genero: z.string().trim().min(1).optional(),
    imagenUrl: z.url().optional()

});


export {idPeliculaSchema, crearPeliculaSchema, actualizarPeliculaSchema};