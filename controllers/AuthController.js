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

  // POST /auth/login
  login = async (req, res) => {
    const resultado = await this.#useCases.login(req.body);

    res.json(resultado);
  };
}

export default AuthController;
