import { sequelize } from "../../connection/sequelize.js";

import UsuarioModel from "./UsuarioModel.js";
import PeliculaModel from "./PeliculaModel.js";
import ReservaModel from "./ReservaModel.js";

// ----------------------------------------------------
// Relaciones 1:N
// ----------------------------------------------------

// Un usuario puede tener muchas reservas.
UsuarioModel.hasMany(ReservaModel, {
  foreignKey: "usuarioId",
  as: "reservas",
  onDelete: "RESTRICT"
});

// Cada reserva pertenece a un usuario.
ReservaModel.belongsTo(UsuarioModel, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "RESTRICT"
});

// Una pelicula puede tener muchas reservas.
PeliculaModel.hasMany(ReservaModel, {
  foreignKey: "peliculaId",
  as: "reservas",
  onDelete: "RESTRICT"
});

// Cada reserva pertenece a una pelicula.
ReservaModel.belongsTo(PeliculaModel, {
  foreignKey: "peliculaId",
  as: "pelicula",
  onDelete: "RESTRICT"
});

// ----------------------------------------------------
// Relacion N:N mediante Reserva
// ----------------------------------------------------

// Un usuario puede reservar distintas peliculas.
UsuarioModel.belongsToMany(PeliculaModel, {
  through: {
    model: ReservaModel,
    unique: false
  },
  foreignKey: "usuarioId",
  otherKey: "peliculaId",
  as: "peliculas",
  onDelete: "RESTRICT"
});

// Una pelicula puede ser reservada por varios usuarios.
PeliculaModel.belongsToMany(UsuarioModel, {
  through: {
    model: ReservaModel,
    unique: false
  },
  foreignKey: "peliculaId",
  otherKey: "usuarioId",
  as: "usuarios",
  onDelete: "RESTRICT"
});

// Exportamos la conexión y los modelos.
export {
  sequelize,
  UsuarioModel,
  PeliculaModel,
  ReservaModel
};

//Models implementados seguir con: Fase 2.4 