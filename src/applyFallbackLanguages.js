const copyLangStr = require('./copyLangStr')
const fallback = require('./fallback.json')

/**
 * copy all strings which are missing in the current language from the fallback language
 */
module.exports = function applyFallbackLanguages (data, options={}) {
  let done = {}

  for (let lang in data) {
    applyFallbackLanguage(data, options, lang, done)
  }
}

function applyFallbackLanguage (data, options, lang, done) {
  let hasRegion = lang.match(/^([a-z]{2,3})-/)
  let fallbackLang = fallback[lang] || (hasRegion ? hasRegion[1] : 'en')

  if (done[lang]) {
    return
  }

  if (fallbackLang !== 'en') {
    applyFallbackLanguage(data, options, fallbackLang, done)
  }

  for (let k in data[fallbackLang]) {
    if (!(k in data[lang])) {
      data[lang][k] = data[fallbackLang][k]
    }
  }

  done[lang] = true
}
