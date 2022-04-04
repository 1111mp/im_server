import { DefaultContext } from "koa";
import { IM } from "../src/IM/im";

declare module "koa" {
  interface DefaultContext {
    userId: number;
    im: IM;
  }
}
