import { Router } from "express";
import swaggerUi from "swagger-ui-express";

// Publico la docu de OpenAPI en /api-docs y con swagger-ui 
function createDocsRoutes(spec) {
  const router = Router();

  router.get("/openapi.json", (req, res) => res.json(spec));

  router.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spec)
  );

  return router;
}

export default createDocsRoutes;