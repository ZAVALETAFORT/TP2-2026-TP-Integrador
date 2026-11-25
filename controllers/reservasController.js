import AppError from "../errors/AppError.js";

class ReservasController {
  #useCases;

  // Recibe los casos de uso preparados por el Container.
  constructor(useCases) {
    this.#useCases = useCases;
  }
//LIST
  // Devuelve todas las reservas o las que coincidan con los filtros.
  list = async (req, res) => {
    const reservas = await this.#useCases.getReservas(req.query, req.user);

    res.json(reservas);
  };

  //GET
  // Busca una reserva por ID y responde 404 si no existe.
  get = async (req, res) => {
    const reserva = await this.#useCases.getReservaById(req.params.id, req.user);

    if (!reserva) {
      throw new AppError(
        "RESERVA_NOT_FOUND",
        "No existe una reserva con ese ID",
        404,
      );
    }

    res.json(reserva);
  };

  //CREATE
  // Crea una reserva y responde HTTP 201.
  create = async (req, res) => {
    const reserva = await this.#useCases.createReserva(req.body, req.user);

    res.status(201).json(reserva);
  };

  //UPDATE
  // Modifica la cantidad o cancela una reserva.
  update = async (req, res) => {
    const reserva = await this.#useCases.updateReserva(req.params.id, req.body, req.user);

    if (!reserva) {
      throw new AppError(
        "RESERVA_NOT_FOUND",
        "No existe una reserva con ese ID",
        404,
      );
    }

    res.json(reserva);
  };

  // Elimina una reserva y responde HTTP 204.
  remove = async (req, res) => {
    const eliminada = await this.#useCases.deleteReserva(req.params.id);

    if (!eliminada) {
      throw new AppError(
        "RESERVA_NOT_FOUND",
        "No existe una reserva con ese ID",
        404,
      );
    }

    res.status(204).send();
  };
}

export default ReservasController;