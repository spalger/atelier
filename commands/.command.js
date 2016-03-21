import { AbstractCommand } from '../lib'

export class InitCommand extends AbstractCommand {
  static cmd = 'init'
  static description = 'Initialize atelier in your app'

  init() {}

  async run() {
  }
}
