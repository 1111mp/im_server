import { resolve, join } from "path";

export const Config = {
  secretOrPrivateKey: "random str",
  logConfig: resolve(__dirname, "./log4js.json"),
  unlessPaths: [
    "/",
    "/api/docs",
    "/api/swagger.json",
    "/api/user/login",
    "/api/user/register",
    "/favicon.ico",
    /^\/upload/,
    /^\/stylesheets/,
  ],
  // token的有效时间 一个月
  tokenExp: 30 * 24 * 60 * 60 * 1000,
  uploadPath: join(__dirname, "../public/upload"),
  uploadChunkPath: join(__dirname, "../public/upload/chunks"),
};
