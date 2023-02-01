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
    this.log4js.log(`${optionalParams} ${message}`);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    this.log4js.error(`${optionalParams} ${message}`);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    this.log4js.warn(`${optionalParams} ${message}`);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {
    this.log4js.debug(`${optionalParams} ${message}`);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {
    this.log4js.trace(`${optionalParams} ${message}`);
  }
}
