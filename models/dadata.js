import BaseModel from 'basemodelts'

const DADATA_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

export default class DaDataModel extends BaseModel {
  constructor (token) {
    this.setToken(token)
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
