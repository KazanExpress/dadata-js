import { DaDataModel } from '../models/dadata'
import * as Responses from './responses'

declare enum SuggestionTypes {
  NAME = 'fio',
  ADDRESS = 'address',
  PARTY = 'party',
  EMAIL = 'email',
  BANK = 'bank'
}

interface Options {

}

export default class DaData {
  constructor (options: DaData)

  readonly suggestions: any[]

  model: DaDataModel<this>

  suggest (type: SuggestionTypes, query: string, count?: number, options?: any): Promise<string>

  clearCache(): any[]

  detectAddressByIP(): any
}

export { Responses, SuggestionTypes, Options }
