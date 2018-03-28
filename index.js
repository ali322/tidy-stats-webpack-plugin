let fs = require('fs-extra')
let chalk = require('chalk')
let clearConsole = require('clear-console')
let { emojis } = require('./util')
let formatMessages = require('./util/format-message')
let formatAsset = require('./util/format-asset')

function TidyStatsPlugin(options) {
  this.options = options || {}
}

function tip(info, level = 'success') {
  let emoji = ':ok_hand:'
  switch (level) {
    case 'error':
      emoji = ':broken_heart:'
      break
    case 'warning':
      emoji = ':warning:'
      break
  }
  console.log(emojis(emoji) + '  ' + info)
}

TidyStatsPlugin.prototype.apply = function(compiler) {
  let options = this.options
  let onErrors = options.onErrors || function() {}
  let onWarnings = options.onWarnings || function() {}
  let writeToFile = options.writeToFile
  let errorsOnly = options.errorsOnly || false
  let ignoreAssets = options.ignoreAssets || false
  let shouldClear = options.clearConsole || false
  let identifier = options.identifier
  let done = stats => {
    let messages = formatMessages(stats)
    let time = stats.toJson().time
    let bufs = []
    if (shouldClear) {
      clearConsole()
    }
    if (messages.errors.length) {
      tip(`Build failed by ${time}ms`, 'error')
      messages.errors.forEach(function(e) {
        bufs.push(chalk.red(e))
      })
      onErrors(messages.errors)
    } else {
      if (messages.warnings.length) {
        tip(`Build with warnings by ${time}ms`, 'warning')
        messages.warnings.forEach(function(e) {
          bufs.push(chalk.yellow(e))
        })
        onWarnings(messages.warnings)
      } else {
        !errorsOnly &&
          tip(identifier ? `Build ${identifier} success by ${time}ms` : `Build success by ${time}ms`)
      }
      !ignoreAssets &&
        bufs.push(formatAsset(stats.toJson({ chunks: false, modules: false })))
    }
    if (typeof writeToFile === 'string' && writeToFile) {
      try {
        fs.outputJsonSync(writeToFile, bufs)
      } catch (err) {
        console.error(err)
      }
    } else {
      bufs.length && console.log(bufs.join('\n'))
    }
  }
  let invalid = () => {}
  if (compiler.hooks) {
    compiler.hooks.done.tap('TidyStatsPlugin', done)
    compiler.hooks.invalid.tap('TidyStatsPlugin', invalid)
  } else {
    compiler.plugin('done', done)
    compiler.plugin('invalid', invalid)
  }
}

module.exports = TidyStatsPlugin
