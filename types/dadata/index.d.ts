import { DaDataModel } from '../models/dadata'
import * as Responses from './responses'

type SuggestionType = 'fio' | 'address' | 'party' | 'email' | 'bank'

interface Options {

}

export default class DaData {
  constructor (options: DaData)

  readonly suggestions: any[]

  model: DaDataModel<this>

  suggest (type: SuggestionType, query: string, count?: number, options?: any): Promise<string>

  clearCache(): any[]

  detectAddressByIP(): any
}

export { Responses, SuggestionType, Options }
