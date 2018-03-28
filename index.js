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

function now() {
  return new Date().toTimeString().split(' ')[0]
}

TidyStatsPlugin.prototype.apply = function(compiler) {
  let options = this.options
  let onErrors = options.onErrors || function() {}
  let onWarnings = options.onWarnings || function() {}
  let writeToFile = options.writeToFile
  let errorsOnly = options.errorsOnly || false
  let time = typeof options.time === 'boolean' ? options.time : true
  let ignoreAssets = options.ignoreAssets || false
  let shouldClear = options.clearConsole || false
  let identifier = options.identifier
  let done = stats => {
    let messages = formatMessages(stats)
    let duration = stats.toJson().time
    let bufs = []
    if (shouldClear) {
      clearConsole()
    }
    let tipPrefix = identifier ? `Build ${identifier}` : 'Build'
    let tipSuffix = time ? ` at ${now()} by ${duration}`: ''
    if (messages.errors.length) {
      tip(`${tipPrefix} failed${tipSuffix}`, 'error')
      messages.errors.forEach(function(e) {
        bufs.push(chalk.red(e))
      })
      onErrors(messages.errors)
    } else {
      if (messages.warnings.length) {
        tip(`${tipPrefix} with warnings${tipSuffix}`, 'warning')
        messages.warnings.forEach(function(e) {
          bufs.push(chalk.yellow(e))
        })
        onWarnings(messages.warnings)
      } else {
        !errorsOnly &&
          tip(`${tipPrefix} success${tipSuffix}` )
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
