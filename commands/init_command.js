import { join } from 'path'
import inquirer from 'inquirer'
import pkg from '../package.json'

import { fcb, read, write, mkdir, exec, AbstractCommand } from '../lib'

async function ask(prompts) {
  return await fcb(cb => {
    inquirer.prompt(prompts, (answers) => {
      cb(null, answers)
    })
  })
}

export class InitCommand extends AbstractCommand {
  static cmd = 'init <project name>'
  static description = 'Initialize atelier in your app'
  static options = [
    ['--link', 'Link atelier rather than install it from npm (for dev)'],
  ]
  static initConfig = false

  init() {}

  async run() {
    const [projectName] = this.positionalArgs

    const projectRoot = join(process.cwd(), projectName)
    const newPkgPath = join(projectRoot, 'package.json')

    const npm = async (args, interesting) => {
      const cmd = 'npm'
      const cwd = projectRoot
      const stdio = interesting ? 'inherit' : ['ignore', 'ignore', 'inherit']
      await exec({ cmd, args, cwd, stdio })
    }

    const { target } = await ask([
      {
        name: 'target',
        type: 'list',
        message: 'What type of project is this?',
        choices: [
          { name: 'node module', value: 'npm' },
          'executable',
          { name: 'front-end', value: 'web' },
        ],
      },
    ])

    this.log.status(`initializing ${projectName} at ${projectRoot}`)
    await mkdir(projectRoot)
    await write(join(projectRoot, `${projectName}.js`), 'console.log(\'hello world\')')
    await npm(['init', '-y'])

    this.log.status('creating .eslintrc file')
    await write(join(projectRoot, '.eslintrc'), {
      extends: './node_modules/atelier/eslint-config.js',
    })

    this.log.status('updating package.json')
    const newPkg = JSON.parse(await read(newPkgPath))

    newPkg.main = `dist/${projectName}.js`
    newPkg.atelier = { target }
    newPkg.scripts = {
      ...newPkg.scripts,
      build: 'atelier build',
      dev: 'atelier build --watch',
      lint: 'atelier lint',
    }
    newPkg.devDependencies = {
      atelier: `^${pkg.version}`,
      'babel-eslint': pkg.devDependencies['babel-eslint'],
      eslint: pkg.devDependencies.eslint,
      'eslint-plugin-react': pkg.devDependencies['eslint-plugin-react'],
    }

    await write(newPkgPath, newPkg)

    await this.log.status('installing npm dependencies', async () => {
      if (this.options.link) {
        await npm(['link', '../atelier'], true)
      } else {
        await npm(['install'], true)
      }
    })

    this.log.writeln(this.log.unindent(`
      Init is complete, now move into ${projectName} and GET TO WORK

        cd ${JSON.stringify(projectName)}
    `))
    this.log.writeln()
  }
}
