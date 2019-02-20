let webpack = require('webpack')
let path = require('path')
let fs = require('fs')
let expect = require('chai').expect
let TidyStatsPlugin = require('../')

const OUTPUT_PATH = path.join(__dirname, 'dist')
const STATS_PATH = path.join(OUTPUT_PATH, 'test','stats.json')

describe('Tidy Stats Plugin', () => {
  it('should output correctly', done => {
    let compiler = webpack(
      {
        entry: {
          main: path.join(__dirname, 'fixture', 'entry.js')
        },
        mode: 'production',
        output: {
          path: OUTPUT_PATH,
          filename: '[name].min.js'
        },
        plugins: [
          new TidyStatsPlugin({
            identifier: 'main',
            writeToFile: STATS_PATH
          })
        ]
      },
      (err, stats) => {
        expect(err).to.equal(null)
        done()
      }
    )
  })
})
