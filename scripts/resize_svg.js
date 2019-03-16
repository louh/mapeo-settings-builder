const xml2js = require('xml2js')

const parser = new xml2js.Parser()
const builder = new xml2js.Builder()

module.exports = function (svg, size, cb) {
  if (Buffer.isBuffer(svg)) {
    svg = svg.toString()
  } else if (typeof svg !== 'string') {
    return cb(new Error('Invalid svg'))
  }
  parser.parseString(svg, function (err, result) {
    if (err) return cb(err)
    let viewBox = result.svg.$.viewBox
    if (viewBox === undefined) {
      if (result.svg.$.width !== undefined && result.svg.$.height !== undefined) {
        viewBox = `0 0 ${result.svg.$.width} ${result.svg.$.height}`
      }
    }
    const [x, y, width, height] = viewBox.split(/\s+/).map(n => parseFloat(n))
    if (width > height) {
      const diff = width - height
      viewBox = `${x} ${y - diff / 2} ${width} ${height + diff / 2}`
    } else {
      const diff = height - width
      viewBox = `${x - diff / 2} ${y} ${width + diff / 2} ${height}`
    }
    result.svg.$.height = result.svg.$.width = size
    result.svg.$.viewBox = viewBox

    const resizedSvg = builder.buildObject(result)
    cb(null, resizedSvg)
  })
}
