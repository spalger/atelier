import { attempt } from 'bluebird'
import { CliConfig, Logger } from './'

export class AbstractCommand {
  constructor({ positionalArgs, options, config, log }) {
    this.positionalArgs = positionalArgs
    this.options = options
    this.config = config
    this.log = log
  }

  static async bindToCommander(Command, program) {
    program
      .command(Command.cmd)
      .description(Command.description)
      .action((...positionalArgs) => {
        const options = positionalArgs.pop()
        const log = new Logger(Command)
        attempt(async () => {
          const config = new CliConfig()
          await config.init(process.cwd())
          const cmd = new Command({ positionalArgs, options, config, log })
          await cmd.init()
          await cmd.run()
        })
        .catch(log.catchHandler())
      })
  }

  init() {
    throw new TypeError(`${this.constructor.name} must a implement an #init() method`)
  }

  run() {
    throw new TypeError(`${this.constructor.name} must a implement a #run() method`)
  }
}
