/** https://juejin.im/post/5b173fa8f265da6e484cf163 */
/** https://github.com/Unitech/pm2/issues/2675 */
const packageJson = require("./package.json");
const appName = packageJson.name;

module.exports = {
  apps: [
    {
      // 指定解释器
      interpreter: "ts-node",
      // // 解释器参数 -P 表示项目路径，会自动使用项目的 tsconfig.json
      // interpreter_args: "-P ./ -r tsconfig-paths/register",
      cwd: "./",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "./logs/app/app-err.log", // 错误日志文件
      out_file: "./logs/app/app-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      kill_timeout: 10000,
      name: appName,
      script: "./run/index.ts",
      args: "-r @noshot/env",
      wait_ready: true,
      watch: false,
      // watch: ['server'],
      ignore_watch: ["node_modules"],
      watch_options: {
        usePolling: true,
      },
    },
  ],
};
