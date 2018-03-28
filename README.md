Tidy-stats-webpack-plugin [![Build Status](https://travis-ci.org/ali322/tidy-stats-webpack-plugin.svg?branch=master)](https://travis-ci.org/ali322/tidy-stats-webpack-plugin) [![npm version](https://badge.fury.io/js/tidy-stats-webpack-plugin.svg)](https://badge.fury.io/js/tidy-stats-webpack-plugin)
===

[![NPM](https://nodei.co/npm/tidy-stats-webpack-plugin.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/tidy-stats-webpack-plugin/)

Tidy-stats-webpack-plugin output more tidy and clearness
stats, provide a better
Developer Experience.

## Getting started

### Installation

```bash
npm install tidy-stats-webpack-plugin --save-dev
```

### Basic usage

Simply add `TidyStatsWebpackPlugin` to the plugin section in your Webpack config.

```javascript
var TidyStatsWebpackPlugin = require('tidy-stats-webpack-plugin');

var webpackConfig = {
  // ...
  plugins: [
    new TidyStatsWebpackPlugin({
      errorsOnly: true
    }),
  ],
  // ...
}
```

### Turn off errors

You need to turn off all error logging by setting your webpack config quiet option to true.

```javascript
app.use(require('webpack-dev-middleware')(compiler, {
  quiet: true,
  publicPath: config.output.publicPath,
}));
```

If you use the webpack-dev-server, there is a setting in webpack's ```devServer``` options:

```javascript
// webpack config root
{
  // ...
  devServer: {
    // ...
    quiet: true,
    // ...
  },
  // ...
}
```

If you use webpack-hot-middleware, that is done by setting the log option to a no-op. You can do something sort of like this, depending upon your setup:

```javascript
app.use(require('webpack-hot-middleware')(compiler, {
  log: () => {}
}));
```

## Options

You can pass options to the plugin:

```js
new TidyStatsPlugin({
  onErrors: function (errors) {
    // called when errors occured
  },
  onWarnings: function(warnings) {
    // called when warnings occured
  },
  // write all stats into file
  writeToFile: 'path/to/stats.json',
  // should show errors only or not
  errorsOnly: true,
  // dont show assets
  ignoreAsset: false,
  // should the console be cleared between each compilation?
  // default is true
  clearConsole: true
})
```

## Adding desktop notifications

The plugin has no native support for desktop notifications but it is easy
to add them thanks to [node-notifier](https://www.npmjs.com/package/node-notifier) for instance.

```js
var TidyStatsPlugin = require('tidy-stats-webpack-plugin');
var notifier = require('node-notifier');
var ICON = path.join(__dirname, 'icon.png');

new TidyStatsPlugin({
    onErrors: (,errors) => {
      const error = errors[0];
      notifier.notify({
        title: "Webpack error",
        message: error.name,
        subtitle: error.file || '',
        icon: ICON
      });
    }
  })
]
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
