import { DaDataModel } from '../models/dadata';
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
  constructor (options: DaData);

  model: DaDataModel<this>

  suggest (type: SuggestionTypes, query: string, count?: number, options?: any): Promise<string>

  getLocationByIP(): {
    lattitude: string,
    longitude: string
  }
}

export { Responses, SuggestionTypes, Options }
