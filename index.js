let fs = require('fs-extra')
let colors = require('colors')
let clearConsole = require('clear-console')
let { emojis } = require('./util')
let formatMessages = require('./util/format-message')
let formatAsset = require('./util/format-asset')
let { sprintf } = require('sprintf-js')

function TidyStatsPlugin(options) {
  this.options = options || {}
}

function tip(info, level = 'success') {
  let emoji = ':ok_hand:'
  let text = colors.green(info)
  switch (level) {
    case 'error':
      emoji = ':broken_heart:'
      text = colors.red(info)
      break
    case 'warning':
      emoji = ':warning:'
      text = colors.yellow(info)
      break
  }
  console.log(emojis(emoji) + '  ' + text)
}

function now() {
  return new Date().toTimeString().split(' ')[0]
}

TidyStatsPlugin.prototype.apply = function(compiler) {
  let options = this.options
  let onErrors = options.onErrors || function() {}
  let logText = options.logText || {}
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
    let tipPrefix = identifier ? 'Build %s' : 'Build'
    let tipSuffix = time ? ` at %s by %dms` : ''
    if (messages.errors.length) {
      tip(
        sprintf(
          logText.error || `${tipPrefix} failed${tipSuffix}`,
          identifier,
          now(),
          duration
        ),
        'error'
      )
      messages.errors.forEach(function(e) {
        bufs.push(colors.red(e))
      })
      onErrors(messages.errors)
    } else {
      if (messages.warnings.length) {
        tip(
          sprintf(
            logText.warn || `${tipPrefix} with warnings${tipSuffix}`,
            identifier,
            now(),
            duration
          ),
          'warning'
        )
        messages.warnings.forEach(function(e) {
          bufs.push(colors.yellow(e))
        })
        onWarnings(messages.warnings)
      } else {
        !errorsOnly &&
          tip(
            sprintf(
              logText.success || `${tipPrefix} success${tipSuffix}`,
              identifier,
              now(),
              duration
            )
          )
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
