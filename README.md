# This is forge-externals-plugin in Typescript for electron-forge 6.x original plugin has outdated APIs for this is a fixed version. 

## kurdin/forge-externals-plugin

When using Electron with Webpack, the easiest way to support native
modules is to add them to Webpack `externals` configuration. This tells webpack
to load them from `node_modules` via `require()`:

```js
module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
  externals: {
    // Always load `native-hello-world` via require
    "native-hello-world": "commonjs2 native-hello-world",
  },
};
```

This works in development but with Electron Forge + Webpack,
`node_modules` gets excluded during packaging so the modules are missing in the
packaged app.

This plugin should be added after `WebpackPlugin` and it
ensures that your external modules and their dependencies are included in the
packaged app.

here is example of `forge.config.ts`

```js
...
const { ForgeExternalsPlugin } = require('@kurdin/forge-externals-plugin')
...

const config: ForgeConfig = {
  packagerConfig: {
    icon: 'src/assets/app-icons/icon'
  },
  rebuildConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'kurdin',
          name: 'your-app-name'
        },
        prerelease: true,
        draft: true,
        authToken: process.env.GITHUB_TOKEN
      }
    }
  ],
  ...
  plugins: [
    new WebpackPlugin({...}),
    new ForgeExternalsPlugin({
      externals: ['native-hello-world'],
      includeDeps: true
    })
  ]
}

export default config
```
