class AuthController {
  #useCases;

  constructor(useCases) {
    this.#useCases = useCases;
  }

  register = async (req, res) => {
    const usuario = await this.#useCases.register(req.body);

    // Nunca devolver el hash al cliente.
    const { passwordHash, ...publicUser } = usuario;

    res.status(201).json(publicUser);
  };
}

export default AuthController;