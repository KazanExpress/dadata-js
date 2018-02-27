import BaseModel from 'basemodelts/src'

export class DaDataModel<T> extends BaseModel<T> {
  private _headers: Headers

  constructor (root: T, token: string)

  public headers: Headers
  public addHeaders (headers: Headers): void
  public setToken (token: string): void
}

export interface Headers {
  'Content-Type': 'application/json' | 'application/xml'
  'Accept': 'application/json' | 'application/xml'
  'Authorization'?: string
}
