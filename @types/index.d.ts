import { DefaultContext } from "koa";
import { IM } from "../IM/im";

declare module "koa" {
  interface DefaultContext {
    userId: number;
    im: IM;
  }
}
