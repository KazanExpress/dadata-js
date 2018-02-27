import * as Responses from './responses'

declare enum Suggestions {
  NAME = 'name',
  ADDRESS = 'address',
  PARTY = 'party',
  EMAIL = 'email',
  BANK = 'bank'
}

interface Options {

}

export default class DaData {
  constructor (options: DaData);
  fixData (type: DaData, text: string): Promise<string>;
}

export { Responses, Suggestions, Options }
