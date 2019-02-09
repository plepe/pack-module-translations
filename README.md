# pack-module-translations
Iterate through all node modules and load translation files to merge them into a single packed file per language.

Iterate through all sub-modules of your node program (and sub-sub-modules) and look for a "translationPath" in the `package.json` file. If it is defined, it will load all translations from this directory (see supported formats below). It will merge all translated files into a single file per language and place this in the `dist/` directory of your program.

Also, it replaces non-translated strings by strings from a fallback language. By default, for regions it will fallback to the main language. You can specify special fallback languages in `src/fallback.json`. Finally, each language will fallback to English (en).:
* `de-at` -> `de` -> `en`
* `gl` (Galician, which is spoken in parts of Spain) -> `es` -> `en`

### Supported formats
#### Simple JSON files / JSON i18next files ####
A file per language with the language code as file name, e.g. `ru.json` for Russian, `de-at.json` for German (Austria). Simple key/value pairs. If a value is an empty string or `null`, it counts as not translated and will be ignored.

Example:
```json
{
  "hello": "Hello World!",
  "apple": "I have an apple"
}
```

#### WebExtension JSON ####
A file per language with the language code as file name, e.g. `ru.json` for Russian, `de-at.json` for German (Austria). Every key has an object with a "message" and maybe other values. If there's a description, it will be removed (to save space in the output file). If the "message" is an empty string or not defined, it counts as not translated and will be ignored.

Example:
```json
{
  "hello": {
    "message": "Hello World!",
    "description": "Some description"
  },
  "apple": {
    "message": "I have an apple"
  }
}
```

## Usage
### Globally
```sh
npm install -g pack-module-translations
pack-module-translations
ls dist/
```

### Inside of a node program
```sh
npm install pack-module-translations
```

Create script in package.json
```json
  "scripts": {
    "pack-module-translations": "pack-module-translations"
  }
```

```sh
npm run pack-module-translations
ls dist/
```
