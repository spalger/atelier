import { stat, readFile } from 'fs'
import { fromCallback as fcb } from 'bluebird'
import { join, relative } from 'path'
import { cloneDeep, get, has } from 'lodash'
import { makeRe } from 'minimatch'

import { cliConfigSchema } from './'

export class CliConfig {
  async init(cwd) {
    const projectRoot = await this._findProjectRoot(cwd)
    const pkg = await this._readPkg(projectRoot)
    const validated = this._validateInput({ pkg })

    this._meta = { projectRoot, pkg }
    this._store = this._buildStore({ projectRoot, ...validated })
  }

  async _readPkg(from) {
    const config = await fcb(cb => readFile(join(from, 'package.json'), 'utf8', cb))
    return JSON.parse(config)
  }

  async _findProjectRoot(cwd) {
    return (async function check(dir) {
      try {
        const _stat = await fcb(cb => stat(join(dir, 'package.json'), cb))
        if (_stat.isFile()) {
          return dir
        }
      } catch (e) { /* assume this is the wrong directory */ }

      const parent = join(dir, '..')
      if (parent === dir) {
        throw new Error(
          'Unable to find project root. Atelier must be run in a project with a package.json file.'
        )
      }

      return await check(parent)
    }(cwd))
  }

  _validateInput({ pkg }) {
    const joiResp = cliConfigSchema.validate({
      name: pkg.name.startsWith('@') ? pkg.name.split('/').slice(1).join('/') : pkg.name,
      main: pkg.main,
      pkgConfig: pkg.atelier,
    })

    const { errors, value: values } = joiResp

    if (errors) {
      throw new Error(JSON.stringify(errors, null, '  '))
    }

    return values
  }

  _buildStore({ projectRoot, pkgConfig, name, main }) {
    const dist = join(projectRoot, 'dist')
    const workspace = join(projectRoot, '.atelier')
    const entryFile = relative(dist, main)
    const target = pkgConfig.target

    const noTransformJs = pkgConfig.noTransformJs.map(p => {
      const re = makeRe(join(projectRoot, p))
      return {
        test(val) {
          return re.test(val.split('!').pop())
        },
      }
    })

    return { projectRoot, dist, target, entryFile, name, noTransformJs, workspace }
  }

  get(name) {
    const values = this._store
    if (!has(values, name)) {
      throw new Error(`unkown config key ${JSON.stringify(name)}`)
    }

    return cloneDeep(get(values, name))
  }

  getPackage() {
    return cloneDeep(this._meta.pkg)
  }

  getProjectRoot() {
    return cloneDeep(this._meta.projectRoot)
  }
}
