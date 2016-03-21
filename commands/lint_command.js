import { resolve, delimiter } from 'path'

import { AbstractCommand, exec } from '../lib'

export class LintCommand extends AbstractCommand {
  static cmd = 'lint'
  static description = 'Lint your app'

  init() {}

  async run() {
    try {
      await this.log.status('linting with eslint', async () => {
        await exec({
          cmd: 'eslint',
          args: [
            '--ignore-pattern',
            'dist/**/*',
            '.',
          ],
          cwd: this.config.get('projectRoot'),
          env: {
            ...process.env,
            PATH: [
              resolve(__dirname, '../node_modules/.bin'),
              ...(process.env.PATH || '').split(delimiter),
            ].join(delimiter),
          },
          stdio: 'inherit',
        })
      })
    } catch (err) {
      if (err && err.exitCode) {
        process.exitCode = err.exitCode
        return // ignore status code errors
      }

      throw err
    }
  }
}
