let os = require('os')
let emoji = require('node-emoji')

exports.emojis = (key) => {
  if (os.platform() === 'darwin') {
    return emoji.get(key)
  } else {
    return '>'
  }
}