import { BaseModel } from 'basemodelts'

export class DaDataModel extends BaseModel {
  private _headers: Headers

  constructor (token: string)

  public headers: Headers
  public addHeaders (headers: Headers)
  public setToken (token: string)
}

export interface Headers {
  'Content-Type': 'application/json' | 'application/xml'
  'Accept': 'application/json' | 'application/xml'
  'Authorization'?: string
}

import DaData, { Responses } from "../dadata";
