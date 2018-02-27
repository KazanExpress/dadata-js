import BaseModel from 'basemodelts'

const DADATA_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

export default class DaDataModel extends BaseModel {
  constructor (root, token) {
    super(root)
    this.setToken(token)

    this

    .describeContainer('base', {
      'query': 'string',
      'count': 'int'
    })

    // FIO CONTAINER
    .addContainer('fio extends base', {
      'parts': 'array',
      'gender': 'string'
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
}
