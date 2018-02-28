import DaDataModel from './models/dadata'

export default class DaData {
  constructor (API_KEY) {
    this.model = new DaDataModel(this, API_KEY)
    this.token = API_KEY
    this._suggestions = []
  }

  get suggestions () { return this._suggestions }

  async suggest (type, query/* , count, options */) {
    try {
      var result = await this.model.suggest(type, { query, count: arguments[2] || null, ...(arguments[3] || {}) })

      if (Object.keys(result).length > 0) {
        this._suggestions = result.suggestions
        return this.suggestions
      } else {
        throw new Error('Result is empty')
      }
    } catch (e) {
      return [];
    }
  }

  detectAddressByIP () {
    return this.model.detectAddressByIP(arguments[0])
  }
}
