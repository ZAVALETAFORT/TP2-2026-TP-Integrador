// Notificador por consola: Recibe un asunto y un mensaje y lo imprime en la consola.
const consoleNotifier = {
  async notify({ subject, body }) {
    console.log(`[NOTIFICACIÓN] ${subject} — ${body}`);
  },
};

export default consoleNotifier;
