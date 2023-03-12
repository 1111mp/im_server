import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { configure, Logger, getLogger } from 'log4js';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly log4js: Logger;

  constructor() {
    configure('config/log4js.json');

    this.log4js = getLogger('IM_Server');
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    if (optionalParams === void 0) return this.log4js.log(message);

    const context = optionalParams.splice(optionalParams.length - 1);

    optionalParams.length
      ? this.log4js.log(`[${context}] ${message}`, optionalParams)
      : this.log4js.log(`[${context}] ${message}`);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    this.log4js.error(message, optionalParams);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    if (optionalParams === void 0) return this.log4js.warn(message);

    const context = optionalParams.splice(optionalParams.length - 1);

    optionalParams.length
      ? this.log4js.warn(`[${context}] ${message}`, optionalParams)
      : this.log4js.warn(`[${context}] ${message}`);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {
    if (optionalParams === void 0) return this.log4js.debug(message);

    const context = optionalParams.splice(optionalParams.length - 1);

    optionalParams.length
      ? this.log4js.debug(`[${context}] ${message}`, optionalParams)
      : this.log4js.debug(`[${context}] ${message}`);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {
    if (optionalParams === void 0) return this.log4js.trace(message);

    const context = optionalParams.splice(optionalParams.length - 1);

    optionalParams.length
      ? this.log4js.trace(`[${context}] ${message}`, optionalParams)
      : this.log4js.trace(`[${context}] ${message}`);
  }
}
