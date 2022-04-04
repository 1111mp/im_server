import * as Router from "@koa/router";
import { koaSwagger } from "koa2-swagger-ui";
import * as swaggerJSDoc from "swagger-jsdoc";

export function routes() {
  const api = new Router();

  api.prefix("/api");

  const swaggerDefinition = {
    info: {
      // API informations (required)
      title: "IM_Server", // Title (required)
      version: "1.0.0", // Version (required)
      description: "The description for api.", // Description (optional)
    },
    host: `localhost:${process.env.PORT}`, // Host (optional)
    basePath: "", // Base path (optional)
    schemes: ["http", "https"],
    securityDefinitions: {
      token: {
        type: "apiKey",
        in: "header",
        name: "token",
      },
      userid: {
        type: "apiKey",
        in: "header",
        name: "userid",
      },
    },
  };

  const swaggerSpec = swaggerJSDoc({
    swaggerDefinition,
    apis: ["./src/routes/*.ts"],
  });

  api.get("/swagger.json", async (ctx) => {
    ctx.set("Content-Type", "application/json");
    ctx.body = swaggerSpec;
  });

  api.get(
    "/docs",
    koaSwagger({
      routePrefix: false,
      favicon: "/favicon.ico",
      swaggerOptions: {
        url: "/api/swagger.json",
      },
    })
  );

  return api;
}
