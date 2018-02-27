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
      'count': 'int'
    })

    // FIO CONTAINER
    .addContainer('fio extends base', {
      'parts': 'allow:[null].array',
      'gender': 'string'
    })

    // ADDRESS CONTAINER
    .addContainer('address extends base', {
      'locations': 'allow:[null].array',
      'locations_boost': 'allow:[null].array',
      'from_bound': 'allow:[null].bound',
      'to_bound': 'allow:[null].bound'
    })

    // PARTY CONTAINER
    .addContainer('party extends base', {
      'status': 'allow:[null].array.party_status',
      'type': 'allow:[null].array.party_types',
      'locations': 'allow:[null].array',
    })

    .addFieldProcessorsBulk({
      bound: val => val && val.value ? val : null,
      party_status: val => DADATA_PARTY_STATUSES.includes(val) ? val : null,
      party_types: val => DADATA_PARTY_TYPES.includes(val) ? val : null,
    })

    .addModifiersBulk({
      allow: (value, params) => {
        return { break: ~params.indexOf(value) }
      },
      default: (value, param) => {
        return { value: value || param }
      }
    })
  }

  get headers () {
    return this._headers || {}
  }

  set headers (value = {}) {
    this._headers = value
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

    this[`$${type}`].data = options
    return this.generateQuery({
      uri: `${DADATA_API_URL}/suggest/${type}`,
      method: SUGGESTION_METHODS[type],
      container: type
    })()
  }

}
