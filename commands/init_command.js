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

async function npm(cwd, args) {
  await fcb(cb => execFile('npm', args, { cwd }, (err, stdout, stderr) =>
    cb(err, [stdout, stderr])
  ))
}

export class InitCommand extends AbstractCommand {
  static cmd = 'init <project name>'
  static description = 'Initialize atelier in your app'
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
    await fcb(cb => mkdir(projectRoot, cb))
    await write(join(projectRoot, `${projectName}.js`), 'console.log(\'hello world\')')
    await npm(projectRoot, ['init', '-y'])

    this.log.status('creating .eslintrc file')
    await write(join(projectRoot, '.eslintrc'), json({
      extends: './node_modules/atelier/eslint-config.js',
    }))

    this.log.status('updating package.json')
    const newPkg = JSON.parse(await read(newPkgPath))

    newPkg.main = `dist/${projectName}.js`
    newPkg.atelier = { target }
    newPkg.devDependencies = {
      atelier: `^${pkg.version}`,
    }

    await write(newPkgPath, json(newPkg, null, '  '))

    this.log.status('installing npm dependencies')
    await npm(projectRoot, ['install'])
  }
}
