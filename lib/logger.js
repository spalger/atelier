import { format } from 'util'
import { reset, red, gray, green, cyan } from 'chalk'

const colors = {
  status: green,
  info: gray,
  error: red,
}

export class Logger {
  constructor(CommandClass) {
    this.CommandClass = CommandClass

    this.indent = ''

    const name = this.CommandClass.cmd.split(' ').shift()
    const tag = (v) => `${reset('[')}${(colors[v] || cyan)(v)}${reset(']')}`

    this.status = this.logger(`${tag(name)}${tag('status')}`)
    this.info = this.logger(`${tag(name)}${tag('info')}  `)
    this.error = this.logger(`${tag(name)}${tag('error')} `)
  }

  logger(prefix) {
    const write = (args) => this.writeln(`${prefix} ${format(...args)}`)

    return async (...args) => {
      if (args.length) {
        const block = args[args.length - 1]
        if (typeof block === 'function') {
          write(args.slice(0, -1))
          this.writeln()

          let error = null
          try {
            await block()
          } catch (e) {
            error = e
          }

          this.writeln()
          if (error) {
            write([red('✗'), reset('FAILURE')])
            throw error
          } else {
            write([green('✔︎')])
          }
          return
        }
      }

      write(args)
    }
  }

  catchHandler() {
    return err => {
      this.error(err.stack)
      process.exit(1)
    }
  }

  flatten(str) {
    return str.trim().replace(/\s+/g, ' ')
  }

  unindent(str) {
    const lines = str.split('\n')
    if (!lines.length) return ''

    while (!lines[0].trim()) lines.shift()
    if (!lines.length) return ''

    while (!lines[lines.length - 1].trim()) lines.pop()
    if (!lines.length) return ''

    const indent = lines[0].match(/^\s*/)[0].length
    return lines.map(l => l.slice(indent)).join('\n')
  }

  writeln(text = '') {
    process.stdout.write(`${this.indent}${text}\n`)
  }
}
