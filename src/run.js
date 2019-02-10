const async = require('async')
const fs = require('fs')

const copyLangStr = require('./copyLangStr')
const applyFallbackLanguages = require('./applyFallbackLanguages')
const readFromPath = require('./readFromPath')

function checkPrefixModules (path, callback) {
  fs.readdir(path, { withFileTypes: true }, (err, files) => {
    if (err) {
      return callback(err)
    }

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

  console.log(path)
  fs.readFile(path + '/package.json', (err, module) => {
    module = JSON.parse(module)

    async.parallel([
      // Step 1: descend into sub modules
      (done) => {
        async.eachOf(module.dependencies, (version, dependency, done) => {
            let subPath = path + '/node_modules/' + dependency
            checkModule(subPath, (err, result) => {
              if (err) {
                return done(err)
              }

              copyLangStr(result, allStrings)

              done()
            })
        }, done)
      },
      // Step 2: from this module, load all translations
      (done) => {
        if (!('translationPath' in module)) {
          return done()
        }

        let translationPaths = module.translationPath
        if (!Array.isArray(module.translationPath)) {
          translationPaths = [ translationPaths ]
        }

        async.each(translationPaths, (translationPath, done) => {
          readFromPath(path + '/' + translationPath, {}, (err, strings) => {
            if (err) {
              return done(err)
            }

            copyLangStr(strings, thisModuleStrings)

            done()
          })
        }, done)
      }
    ], (err) => {
      // Step 3: merge strings from sub modules with current module
      copyLangStr(thisModuleStrings, allStrings)

      // Finished!
      callback(err, allStrings)
    })
  })
}

module.exports = function run () {
  checkModule('.', (err, result) => {
    if (err) {
      return console.log(err)
    }

    applyFallbackLanguages(result)

    async.eachOf(result, (str, lang, done) => {
      fs.writeFile('dist/' + lang + '.json', JSON.stringify(str), done)
    }, (err) => {
      if (err) {
        return console.log(err)
      }

      console.log('Done')
    })
  })
}
