import { format } from 'util'
import { reset, red, gray, green } from 'chalk'

export class Logger {
  constructor(CommandClass) {
    this.CommandClass = CommandClass

    const base = reset(`[${this.CommandClass.cmd}]`)
    this.status = this.logger(`${base}[${green('status')}]`)
    this.info = this.logger(`${base}[${gray('info')}]  `)
    this.error = this.logger(`${base}[${red('error')}] `)
  }

  logger(prefix) {
    return (...data) => {
      process.stdout.write(`${prefix} ${format(...data)}\n`)
    }
  }

  catchHandler() {
    return this.error
  }

  trim(str) {
    return str.trim().replace(/\s+/g, ' ')
  }
}
