import DaDataModel from './models/dadata'

export default class DaData {
  constructor (API_KEY) {
    this.model = new DaDataModel(this, API_KEY);
  }

  suggest (type, query/* , count, options */) {
    return this.model.suggest(type, { query, count: arguments[2], ...(arguments[3] || {}) });
  }

  detectAddressByIP () {
    return this.model.detectAddressByIP(arguments[0]);
  }
}
