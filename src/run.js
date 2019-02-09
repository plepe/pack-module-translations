const child_process = require('child_process')
const async = require('async')
const fs = require('fs')

const copyLangStr = require('./copyLangStr')

function checkPrefixModules (path, callback) {
  fs.readdir(path, { withFileTypes: true }, (err, files) => {
    async.each(files, (file, done) => {
      if (file.name.match(/^\./)) {
        return done()
      }

      checkModule(path + '/' + file.name, done)
    }, callback)
  })
}

function checkModule (path, callback) {
  let allStrings = {}
  let thisModuleStrings = {}

  async.parallel([
    // Step 1: descend into sub modules
    (done) => {
      fs.readdir(path + '/node_modules', { withFileTypes: true }, (err, files) => {
        async.each(files, (file, done) => {
          if (file.name.match(/^\./)) {
            return done()
          }

          if (file.name.match(/^@/)) {
            return checkPrefixModules(path + '/node_modules/' + file.name, done)
          }

          let subPath = path + '/node_modules/' + file.name
          checkModule(subPath, (err, result) => {
            if (err) {
              return done(err)
            }

            copyLangStr(result, allStrings)

            done()
          })
        }, done)
      }, done)
    },
    // Step 2: from this module, load all translations
    (done) => {
      fs.readFile(path + '/package.json', (err, mod) => {
        if (err) {
          return done(err)
        }

        mod = JSON.parse(mod)

        if (!('translationPath' in mod)) {
          return done()
        }

        fs.readdir(path + '/' + mod.translationPath, (err, files) => {
          if (err) {
            return done(err)
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

            fs.readFile(path + '/' + mod.translationPath + '/' + file, (err, content) => {
              if (err) {
                return done(err)
              }

              thisModuleStrings[lang] = JSON.parse(content)

              done()
            })
          }, done)
        })
      })
    }
  ], (err) => {
    // Step 3: merge strings from sub modules with current module
    copyLangStr(thisModuleStrings, allStrings)

    // Finished!
    callback(err, allStrings)
  })
}

checkModule('.', (err, result) => {
  if (err) {
    return console.log(err)
  }

  async.eachOf(result, (str, lang, done) => {
    fs.writeFile('dist/' + lang + '.json', JSON.stringify(str), done)
  }, (err) => {
    if (err) {
      return console.log(err)
    }

    console.log('Done')
  })
})