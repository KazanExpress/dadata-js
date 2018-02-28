import BaseModel from 'basemodelts'

const DADATA_API_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'

const DADATA_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

const SUGGESTION_METHODS = {
  'fio': 'POST',
  'address': 'POST',
  'party': 'POST',
  'email': 'POST',
  'bank': 'POST'
}

const DADATA_PARTY_STATUSES = [
  'ACTIVE',
  'LIQUIDATING',
  'LIQUIDATED'
]

const DADATA_PARTY_TYPES = [
  'LEGAL',
  'INDIVIDUAL'
]

export default class DaDataModel extends BaseModel {
  constructor (root, token) {
    super(root)
    this.addHeaders(DADATA_HEADERS)
    this.setToken(token)

    this

    .describeContainer('base', {
      'query': 'string',
      'count?': 'int'
    })

    // FIO CONTAINER
    .addContainer('fio extends base', {
      'parts?': 'array',
      'gender?': 'string'
    })

    // ADDRESS CONTAINER
    .addContainer('address extends base', {
      'locations?': 'array',
      'locations_boost?': 'array',
      'from_bound?': 'bound',
      'to_bound?': 'bound'
    })

    // PARTY CONTAINER
    .addContainer('party extends base', {
      'status?': 'array.party_status',
      'type?': 'array.party_types',
      'locations?': 'array',
    })

    .addFieldProcessorsBulk({
      bound: val => val && val.value ? val : null,
      party_status: val => DADATA_PARTY_STATUSES.includes(val) ? val : null,
      party_types: val => DADATA_PARTY_TYPES.includes(val) ? val : null,
    })

    .addModifiersBulk({
      allow: (value, params) => {
        return { break: !!~params.indexOf(value) }
      },
      default: (value, param) => {
        return { value: value || param }
      }
    })
  }

  get headers () {
    return this._headers || {}
  }

  set headers (value) {
    this._headers = value || {}
  }

  beforeFetch (uri, fetch_params) {
    fetch_params.headers = { ...fetch_params.headers, ...this.headers }
    return { uri, fetch_params }
  }

  addHeaders (headers = {}) {
    this._headers = { ...this._headers, ...headers }
  }

  setToken (token) {
    this.token = token
    this.addHeaders({
      'Authorization': `Token ${token}`
    })
  }

  // QUERY METHODS
  suggest (type, options) {
    if (!this.getContainer(type)) {
      console.error(`DaDataModel::suggest() Suggestion type "${type}" not found`)
      return new Promise((resolve, reject) => {
        reject(`Suggestion type "${type}" not found`)
      })
    }

    this.containers[type].data = { ...options }
    return this.generateQuery({
      uri: `${DADATA_API_URL}/suggest/${type}`,
      method: SUGGESTION_METHODS[type],
      container: type
    })()
  }

}
