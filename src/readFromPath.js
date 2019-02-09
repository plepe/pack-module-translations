const fs = require('fs')
const async = require('async')

module.exports = function readFromPath (path, options, callback) {
  let result = {}

  fs.readdir(path, (err, files) => {
    if (err) {
      return callback(err)
    }

    async.each(files, (file, done) => {
      if (file.match(/^\./) || (!file.match(/\.json$/))) {
        return
      }

      let m = file.match(/^([a-z]{2,3}(\-[a-z]+)?)\.json$/)
      if (!m) {
        return done()
      }
      let lang = m[1]

      fs.readFile(path + '/' + file, (err, content) => {
        if (err) {
          return done(err)
        }

        result[lang] = JSON.parse(content)

        done()
      })
    }, (err) => { callback(err, result) })
  })
}
