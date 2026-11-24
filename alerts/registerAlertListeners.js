import EVENTS from "../events/eventNames.js";

// Registra los listeners de alertas en el bus de eventos
function registerAlertListeners(events, notifier) {
  // Escucha cuando un caso de uso confirma una reserva.
  events.on(
    EVENTS.RESERVA_CREADA,
    async ({ id, usuarioId, peliculaId, cantidad }) => {
      try {
        // Delega la notificación a la interfaz del notifier.
        await notifier.notify({
          subject: "Reserva creada",
          body: `Reserva #${id} | Usuario: ${usuarioId} | Película: ${peliculaId} | Lugares: ${cantidad}`,
        });
      } catch (error) {
        // Si falla la notificación, la reserva sigue confirmada.
        console.error("[Notificaciones] No se pudo notificar:", error.message);
      }
    },
  );
}

export default registerAlertListeners;
