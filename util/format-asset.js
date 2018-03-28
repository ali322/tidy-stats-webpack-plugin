let chalk = require('chalk')

let formatSize = size => {
  if (size <= 0) {
    return '0 bytes'
  }

  const abbreviations = ['bytes', 'KiB', 'MiB', 'GiB']
  const index = Math.floor(Math.log(size) / Math.log(1024))

  return `${+(size / Math.pow(1024, index)).toPrecision(3)} ${
    abbreviations[index]
  }`
}

let formatAsset = (obj, useColors = true) => {
  const buf = []

  const defaultColors = {
    bold: '\u001b[1m',
    yellow: '\u001b[1m\u001b[33m',
    red: '\u001b[1m\u001b[31m',
    green: '\u001b[1m\u001b[32m',
    cyan: '\u001b[1m\u001b[36m',
    magenta: '\u001b[1m\u001b[35m'
  }

  const colors = Object.keys(defaultColors).reduce(
    (obj, color) => {
      obj[color] = str => {
        if (useColors) {
          buf.push(
            useColors === true || useColors[color] === undefined
              ? defaultColors[color]
              : useColors[color]
          )
        }
        buf.push(str)
        if (useColors) {
          buf.push('\u001b[39m\u001b[22m')
        }
      }
      return obj
    },
    {
      normal: str => buf.push(str)
    }
  )

  const newline = () => buf.push('\n')

  const getText = (arr, row, col) => {
    return arr[row][col].value
  }

  const table = (array, align, splitter) => {
    const rows = array.length
    const cols = array[0].length
    const colSizes = new Array(cols)
    for (let col = 0; col < cols; col++) colSizes[col] = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = `${getText(array, row, col)}`
        if (value.length > colSizes[col]) {
          colSizes[col] = value.length
        }
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const format = array[row][col].color
        const value = `${getText(array, row, col)}`
        let l = value.length
        if (align[col] === 'l') format(value)
        for (; l < colSizes[col] && col !== cols - 1; l++) colors.normal(' ')
        if (align[col] === 'r') format(value)
        if (col + 1 < cols && colSizes[col] !== 0)
          colors.normal(splitter || '  ')
      }
      newline()
    }
  }

  const getAssetColor = (asset, defaultColor) => {
    if (asset.isOverSizeLimit) {
      return colors.yellow
    }

    return defaultColor
  }

  if (obj.assets && obj.assets.length > 0) {
    const t = [
      [
        {
          value: 'Asset',
          color: colors.bold
        },
        {
          value: 'Size',
          color: colors.bold
        }
      ]
    ]
    for (const asset of obj.assets) {
      t.push([
        {
          value: asset.name,
          color: getAssetColor(asset, colors.green)
        },
        {
          value: formatSize(asset.size),
          color: getAssetColor(asset, colors.normal)
        }
      ])
    }
    table(t, 'llllll')
  }
  if (obj.filteredAssets > 0) {
    colors.normal(' ')
    if (obj.assets.length > 0) colors.normal('+ ')
    colors.normal(obj.filteredAssets)
    if (obj.assets.length > 0) colors.normal(' hidden')
    colors.normal(obj.filteredAssets !== 1 ? ' assets' : ' asset')
    newline()
  }

  while (buf[buf.length - 1] === '\n') buf.pop()
  return buf.join('')
}

module.exports = formatAsset
