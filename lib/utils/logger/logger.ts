import pino, { Logger as PinoLogger } from 'pino'

export class Logger {
  logger: PinoLogger

  constructor(private silent: boolean = false) {
    this.logger = pino()
  }

  info(message: string) {
    if (this.silent) return
    this.logger.info(message)
  }

  error(message: string) {
    if (this.silent) return
    this.logger.error(message)
  }
}
