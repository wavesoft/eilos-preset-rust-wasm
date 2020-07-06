const fs = require('fs')
const path = require('path')
const TOML = require('@iarna/toml')

const cargoTomlPath = path.resolve('../Cargo.toml')

const importPacketKeys = [
  'name', // — The name of the package.
  'version', // — The version of the package.
  'authors', // — The authors of the package.
  'edition', // — The Rust edition.
  'description', // — A description of the package.
  'documentation', // — URL of the package documentation.
  'readme', // — Path to the package's README file.
  'homepage', // — URL of the package homepage.
  'repository', // — URL of the package source repository.
  'license', // — The package license.
  'license', //-file — Path to the text of the license.
  'keywords', // — Keywords for the package.
  'categories', // — Categories of the package.
  'workspace', // — Path to the workspace for the package.
  'build', // — Path to the package build script.
  'links', // — Name of the native library the package links with.
  'exclude', // — Files to exclude when publishing.
  'include', // — Files to include when publishing.
  'publish', // — Can be used to prevent publishing the package.
  'metadata', // — Extra settings for external tools.
  'default', //-run — The default binary to run by cargo run.
  'autobins', // — Disables binary auto discovery.
  'autoexamples', // — Disables example auto discovery.
  'autotests', // — Disables test auto discovery.
  'autobenches' // — Disables bench auto discovery.
]

module.exports = {
  files: {
    'Cargo.toml': (ctx) => {
      const { merge } = ctx.util
      const packageConfig = ctx.getConfig('package', {})
      const userConfig = ctx.getConfig('cargo', {})
      const entrypoint = ctx.getConfig('entrypoint', 'src/lib.rs')

      // Parse default TOML
      const defaultConfig = TOML.parse(fs.readFileSync(cargoTomlPath), 'utf-8')

      // Enrich with default package configurations
      const cargoPackage = {}
      importPacketKeys.forEach((key) => {
        if (packageConfig[key] != null) {
          cargoPackage[key] = packageConfig[key]
        }
      })
      defaultConfig['package'] = merge(
        defaultConfig['package'] || {},
        cargoPackage
      )

      // Allow adjustment of the
      defaultConfig['lib'] = merge(defaultConfig['lib'] || {}, {
        path: entrypoint
      })

      // Enable optimisations on release
      if (ctx.isProduction()) {
        defaultConfig['lib'] = merge(defaultConfig['lib'] || {}, {
          path: entrypoint
        })
      }

      return TOML.stringify(merge(defaultConfig, userConfig))
    }
  },

  run: (ctx) => {
    const cfgFile = ctx.getConfigFilePath('webpack.config.js')
    const argv = ctx.getConfig('argv', [])

    return ctx.exec(
      'wasm-pack',
      [].concat(
        [
          'build',
          '--manifest-path',
          cfgFile,
          ctx.isDevelop() ? '--dev' : '--release'
        ],
        argv
      )
    )
  }
}
