import { operation, ref, json } from "../operation.js";

export default {
  "/health": {
    get: operation({
      tag: "Salud",
      id: "getHealth",
      summary: "Comprobar estado del servidor",
      authRequired: false,
      responses: {
        200: json("Estado del servidor", ref("Health")),
      },
    }),
  },
};