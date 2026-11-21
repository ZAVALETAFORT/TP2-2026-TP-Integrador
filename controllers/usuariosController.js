import AppError from "../errors/AppError.js";

// Oculta el hash de contraseña en las respuestas HTTP.
function toPublicUser(usuario) {
  const { passwordHash, ...publicUser } = usuario;
  return publicUser;
}

class UsuariosController {
  #useCases;

  constructor(useCases) {
    this.#useCases = useCases;
  }

  // GET /usuarios
  list = async (req, res) => {
    const usuarios = await this.#useCases.getUsuarios();

    res.json(usuarios.map(toPublicUser));
  };

  // GET /usuarios/:id
  get = async (req, res) => {
    const usuario = await this.#useCases.getUsuarioById(
      req.params.id
    );

    if (!usuario) {
      throw new AppError(
        "USUARIO_NOT_FOUND",
        "No existe un usuario con ese ID",
        404
      );
    }

    res.json(toPublicUser(usuario));
  };

  // POST /usuarios
  create = async (req, res) => {
    const usuario = await this.#useCases.createUsuario(
      req.body
    );

    res.status(201).json(toPublicUser(usuario));
  };

  // PUT /usuarios/:id
  update = async (req, res) => {
    const usuario = await this.#useCases.updateUsuario(
      req.params.id,
      req.body
    );

    if (!usuario) {
      throw new AppError(
        "USUARIO_NOT_FOUND",
        "No existe un usuario con ese ID",
        404
      );
    }

    res.json(toPublicUser(usuario));
  };

  // DELETE /usuarios/:id
  remove = async (req, res) => {
    const deleted = await this.#useCases.deleteUsuario(
      req.params.id
    );

    if (!deleted) {
      throw new AppError(
        "USUARIO_NOT_FOUND",
        "No existe un usuario con ese ID",
        404
      );
    }

    res.status(204).send();
  };
}

export default UsuariosController;