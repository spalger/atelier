import { resolve } from 'path'
import webpack from 'webpack'
import { keys, union } from 'lodash'
import { fromCallback as fbc } from 'bluebird'

import babelPreset from './babel_preset'
import { AbstractCommand } from '../lib'

export class BuildCommand extends AbstractCommand {
  static cmd = 'build'
  static description = 'Build your application'

  init() {
    const { config } = this

    const entryFile = config.get('entryFile')
    const target = config.get('target')
    const dist = config.get('dist')
    const workspace = config.get('workspace')
    const name = config.get('name')
    const pkg = config.getPackage()
    const externals = union(keys(pkg.dependencies), keys(pkg.devDependencies))

    this.config = {
      target,
      entry: `./${entryFile}`,
      output: {
        path: dist,
        filename: entryFile,
        libraryTarget: target === 'node' ? 'commonjs' : 'umd',
        umdNamedDefine: name,
      },
      externals,
      devtool: 'source-map',
      devtoolModuleFilenameTemplate: '[resource-path]',
      module: {
        loaders: [
          { test: /\.json$/, loader: 'json' },
          { test: /\.(html|tmpl|txtwoff|woff2|ttf|eot|svg|ico|png)(\?|$)/, loader: 'raw' },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              plugins: babelPreset.plugins,
              cacheDirectory: resolve(workspace, '.babel_cache'),
            },
          },
        ],
        noParse: config.get('noTransformJs'),
      },
    }
  }

  async run() {
    const { log } = this
    log.status('building...')

    const stats = await fbc(cb => webpack(this.config, cb))
    const { compilation: { errors, warnings } } = stats

    const output = stats.toString(true)
    output.split('\n').forEach(line => {
      log.info(`  ${line}`)
    })

    const warns = warnings.length
    const errs = errors.length
    const fail = warns || errs

    log[errs || warns ? 'error' : 'status'](log.trim(`
      build ${fail ? 'failed' : 'complete'}
      ${warns ? ` with ${warns} warning${warns === 1 ? '' : 's'}` : ''}
      ${errs ? ` ${warns ? 'and' : 'with'} ${errs} error${errs === 1 ? '' : 's'}` : ''}
    `))
  }
}
