import 'core-js'
import * as sourceMapSupport from 'source-map-support'
import program from 'commander'
import { yellow } from 'chalk'

import pkg from './package.json'
import { AbstractCommand, inherits, onUnhandledError } from './lib'
import * as commands from './commands'

sourceMapSupport.install()

async function main() {
  program
    .version(pkg.version)
    .description(pkg.description)

  for (const key of Object.keys(commands)) {
    const Command = commands[key]
    if (!inherits(Command, AbstractCommand)) {
      await AbstractCommand.bindToCommander(Command, program)
    }
  }

  program.parse(process.argv)

  const command = program.args[0]
  if (!command) program.help()
  if (!(command instanceof program.Command)) {
    program.help((output) => `\n  unknown command: ${yellow(JSON.stringify(command))}\n${output}`)
  }
}

main().catch(onUnhandledError())
