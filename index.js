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
      var count = arguments[2] || null;
      var options = arguments[3] || {};
      var result = await this.model.suggest(type, { query, count, ...options })

      if (!!result.suggestions) {
        this._suggestions = [...result.suggestions]
        return this.suggestions
      } else {
        throw new Error('Result is empty')
      }
    } catch (e) {
      return [];
    }
  }

  clearCache() {
    const temp = [...this._suggestions];
    this._suggestions.splice(0);
    return temp;
  }

  detectAddressByIP () {
    return this.model.detectAddressByIP(arguments[0] || null)
  }
}
