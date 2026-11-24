import { EventEmitter } from "node:events";

// Crea el bus de eventos interno de la API.
function createEventBus() {
  return new EventEmitter();
}

export default createEventBus;