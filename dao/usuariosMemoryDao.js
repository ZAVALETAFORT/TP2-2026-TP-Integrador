import AppError from "../errors/AppError.js";

class UsuariosMemoryDao {

  #usuarios = [];
  #nextId = 1;

  // Listar todos los usuarios.
  async getAll() {
    return this.#usuarios.map((usuario) => ({ ...usuario }));
  }

  // Buscar usuario por ID.
  async getById(id) {
    const usuario = this.#usuarios.find(
      (u) => u.id === Number(id)
    );

    return usuario ? { ...usuario } : null;
  }

  // Buscar usuario por email.
  async getByEmail(email) {
    const usuario = this.#usuarios.find(
      (u) => u.email === email
    );

    return usuario ? { ...usuario } : null;
  }

  // Crear usuario.
  async save(data) {
    const existente = this.#usuarios.some(
      (u) => u.email === data.email // Verifico si ya existe un usuario con el mismo email
    );

    if (existente) {
      throw new AppError(
        "EMAIL_DUPLICATED",
        "El email ya está registrado",
        409
      );
    }

    const usuario = {
      id: this.#nextId,
      nombre: data.nombre,
      email: data.email,
      passwordHash: data.passwordHash ?? null, 
      rol: data.rol ?? "cliente"
    };

    this.#usuarios.push(usuario);
    this.#nextId += 1; //Asignamos el ID y lo agregamos al array de usuarios

    return { ...usuario };
  }

  // Modificar usuario.
  async update(id, changes) {
    const index = this.#usuarios.findIndex(
      (u) => u.id === Number(id)
    );

    if (index === -1) return null;

    if (
      changes.email !== undefined &&
      this.#usuarios.some(
        (u) =>
          u.email === changes.email &&
          u.id !== Number(id)
      )
    ) {
      throw new AppError(
        "EMAIL_DUPLICATED",
        "El email ya está registrado",
        409
      );
    }

    this.#usuarios[index] = {
      ...this.#usuarios[index],
      ...changes,
      id: this.#usuarios[index].id
    };

    return { ...this.#usuarios[index] };
  }

  // Eliminar usuario.
  async delete(id) {
    const index = this.#usuarios.findIndex(
      (u) => u.id === Number(id)
    );

    if (index === -1) return false;

    this.#usuarios.splice(index, 1);
    return true;
  }
}

export default new UsuariosMemoryDao();