import { BuildCommand } from './'

export class DevCommand extends BuildCommand {
  static cmd = 'dev'
  static description = 'A special version of "build" mode for development'

  init() {
    super.init()
    this.options = {
      watch: true,
      clean: true,
    }
  }
}
