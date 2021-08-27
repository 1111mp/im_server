import * as Router from "@koa/router";
import { koaSwagger } from "koa2-swagger-ui";
import * as yamljs from "yamljs";

export function routes() {
  const api = new Router();

  api.prefix("/api");

  const spec = yamljs.load("./swagger.yaml");

  api.get(
    "/docs",
    koaSwagger({
      routePrefix: false,
      hideTopbar: true,
      swaggerOptions: { spec },
    })
  );

  return api;
}
