/** https://juejin.im/post/5b173fa8f265da6e484cf163 */
const packageJson = require('./package.json')
const appName = packageJson.name

module.exports = {
	apps: [{
		// 指定解释器
		interpreter: './node_modules/.bin/ts-node',
		// 解释器参数 -P 表示项目路径，会自动使用项目的 tsconfig.json
		interpreter_args: '-P ./server -r tsconfig-paths/register',
		cwd: './',
		env: {
			NODE_ENV: 'dev'
		},
		env_production: {
			NODE_ENV: 'prod'
		},
		error_file: "./logs/app/app-err.log",         // 错误日志文件
		out_file: "./logs/app/app-out.log",
		log_date_format: "YYYY-MM-DD HH:mm:ss",
		kill_timeout: 10000,
		name: appName,
		script: './bin/run.ts',
		wait_ready: true,
		watch: false,
		// watch: ['server'],
		ignore_watch: ['node_modules'],
		watch_options: {
			"usePolling": true
		}
	}]
}