import { resolve } from 'path'
import webpack, { BannerPlugin } from 'webpack'
import { keys, union } from 'lodash'
import rimraf from 'rimraf'

import { AbstractCommand, babelPreset, fcb, makeExecutable, onUnhandledError } from '../lib'

export class BuildCommand extends AbstractCommand {
  static cmd = 'build'
  static description = 'Build your application'
  static options = [
    ['-w, --watch', 'Watch for changes and automatically rebuild.'],
    ['-c, --clean', 'Clear out the dist before building.'],
  ]

  init() {
    const { config } = this

    const entryFile = config.get('entryFile')
    const target = config.get('target')
    const dist = config.get('dist')
    const workspace = config.get('workspace')
    const name = config.get('name')
    const pkg = config.getPackage()
    const externals = union(keys(pkg.dependencies), keys(pkg.devDependencies))

    const plugins = []
    if (target === 'executable') {
      plugins.push(new BannerPlugin('#!/usr/bin/env node', {
        raw: true,
        entryOnly: true,
      }))
    }

    this.webpackConfig = {
      target: target === 'web' ? 'web' : 'node',
      entry: `./${entryFile}`,
      output: {
        path: dist,
        filename: entryFile,
        libraryTarget: target === 'web' ? 'umd' : 'commonjs',
        umdNamedDefine: name,
      },
      externals,
      devtool: 'inline-source-map',
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
      plugins,
    }
  }

  async run() {
    const { config, log, options } = this
    log.status('building...')

    const compiler = webpack(this.webpackConfig)

    if (options.clean) {
      await fcb(cb => rimraf(`${config.get('dist')}/*`, cb))
    }

    if (options.watch) {
      await fcb(cb => {
        compiler.watch({}, (err, stats) => {
          if (err) {
            compiler.close()
            cb(err)
          } else {
            this.afterCompile(stats).catch(onUnhandledError())
          }
        })
      })
    } else {
      const stats = await fcb(cb => compiler.run(cb))
      await this.afterCompile(stats)
    }
  }

  async afterCompile(stats) {
    const { config, log } = this
    const { compilation: { errors, warnings, chunks } } = stats

    if (config.get('target') === 'executable') {
      for (const chunk of chunks) {
        for (const file of chunk.files) {
          await makeExecutable(resolve(this.webpackConfig.output.path, file))
        }
      }
    }

    const output = stats.toString(true)
    output.split('\n').forEach(line => {
      log.info(`  ${line}`)
    })

    const warns = warnings.length
    const errs = errors.length
    const fail = warns || errs

    log[errs || warns ? 'error' : 'status'](log.flatten(`
      build ${fail ? 'failed' : 'complete'}
      ${warns ? ` with ${warns} warning${warns === 1 ? '' : 's'}` : ''}
      ${errs ? ` ${warns ? 'and' : 'with'} ${errs} error${errs === 1 ? '' : 's'}` : ''}
    `))
  }
}
