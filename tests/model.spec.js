import DaDataModel from '../models/dadata'
import polyfills from '../polyfills'

const TEST_API_KEY = '278908b74c6a3a5433aaec7c7364a38420722c05'

describe('DaDataModel', () => {
  it('sets token', () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    expect(model.token).toBe(TEST_API_KEY)
  })

  it('adds api headers', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    model.addHeaders({
      'hdr_key': 'hdr_value'
    })

    expect(model.headers).toEqual({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Token asdasdasd',
      'hdr_key': 'hdr_value'
    })
  })

  it('rewrites api headers', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    model.headers = {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml'
    }

    expect(model._headers).toEqual({
      'Content-Type': 'application/xml',
      'Accept': 'application/xml'
    })

    model.headers = null

    expect(model._headers).toEqual({})
  })

  it('describes base container', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(model.described_containers).toHaveProperty('base')
    expect(model.described_containers.base).toEqual({
      'query': 'string',
      'count?': 'int'
    })
  })

  it('adds address container', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(!!model.getContainer('address')).toBe(true)
    expect(model.getContainer('address')).toHaveProperty('fields')
    expect(model.getContainer('address').fields).toEqual({
      'query': 'string',
      'count?': 'int',
      'locations?': 'array',
      'locations_boost?': 'array',
      'from_bound?': 'bound',
      'to_bound?': 'bound'
    })
  })

  it('adds fio container', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(!!model.getContainer('fio')).toBe(true)
    expect(model.getContainer('fio')).toHaveProperty('fields')
    expect(model.getContainer('fio').fields).toEqual({
      'query': 'string',
      'count?': 'int',
      'parts?': 'array',
      'gender?': 'string'
    })
  })

  it('adds party container', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(!!model.getContainer('party')).toBe(true)
    expect(model.getContainer('party')).toHaveProperty('fields')
    expect(model.getContainer('party').fields).toEqual({
      'query': 'string',
      'count?': 'int',
      'status?': 'array.party_status',
      'type?': 'array.party_types',
      'locations?': 'array'
    })
  })

  it('adds email container', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(!!model.getContainer('email')).toBe(true)
    expect(model.getContainer('email')).toHaveProperty('fields')
    expect(model.getContainer('email').fields).toEqual({
      'query': 'string',
      'count?': 'int'
    })
  })

  it('adds bank container', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(!!model.getContainer('bank')).toBe(true)
    expect(model.getContainer('bank')).toHaveProperty('fields')
    expect(model.getContainer('bank').fields).toEqual({
      'query': 'string',
      'count?': 'int',
      'status?': 'array.party_status',
      'type?': 'array.party_types'
    })
  })

  it('sends check status query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.checkStatus()
      expect(res).toBeTruthy()
    } catch (e) {
      console.error('Error', e)
    }
  })

  it('sends check address status query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.checkStatus('address')
      expect(res).toBeTruthy()
    } catch (e) {
      console.error('Error', e)
    }
  })

  it('sends check wrong status query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.checkStatus('whatever')
    } catch (e) {
      expect(e).toEqual({
        error: 'Service "whatever" not found',
      })
    }
  })

  it('sends find address by id query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.findById('address', { query: '77000000000268400' })
      expect(res).toHaveProperty('suggestions')
      expect(res.suggestions).toBeInstanceOf(Array)
      expect(res.suggestions).toHaveLength(1)
    } catch (e) {
      console.error('Error', e)
    }
  })

  it('sends find party by id query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.findById('party', { query: '7719402047' })
      expect(res).toHaveProperty('suggestions')
      expect(res.suggestions).toBeInstanceOf(Array)
      expect(res.suggestions).toHaveLength(1)
    } catch (e) {
      console.error('Error', e)
    }
  })

  it('sends wrong find by id type', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.findById('whatever', { query: '77000000000268400' })
    } catch (e) {
      expect(e).toEqual({
        error: 'Find by id type "whatever" not found',
      })
    }
  })

  it('sends suggest query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.suggest('address', { query: 'Казань', count: 5 })
      expect(res).toHaveProperty('suggestions')
      expect(res.suggestions).toBeInstanceOf(Array)
      expect(res.suggestions).toHaveLength(5)
    } catch (e) {
      console.error('Error', e)
    }
  })

  it('sends wrong suggest type', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.suggest('whatever', { query: 'Казань', count: 5 })
    } catch (e) {
      expect(e).toEqual({
        error: 'Suggestion type "whatever" not found',
      })
    }
  })

  it('sends ip detection query', async () => {
    const model = new DaDataModel(null, TEST_API_KEY)

    try {
      let res = await model.detectAddressByIP()
      expect(res).toHaveProperty('location')
    } catch (e) {
      console.error('Error', e)
    }
  })

  it('sets bound processor', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let proc = model.processors['bound']
    let filtered_val1 = proc({})
    let filtered_val2 = proc({ value: null })
    let filtered_val3 = proc(null)
    let filtered_val4 = proc({ value: 123 })

    expect(proc).toBeInstanceOf(Function)
    expect(filtered_val1).toBe(null)
    expect(filtered_val2).toBe(null)
    expect(filtered_val3).toBe(null)
    expect(filtered_val4).toEqual({ value: 123 })
  })

  it('sets party_status processor', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let proc = model.processors['party_status']
    let filtered_val1 = proc('LIQUIDATING')
    let filtered_val2 = proc('ANY_OTHER')
    let filtered_val3 = proc(null)
    let filtered_val4 = proc()

    expect(proc).toBeInstanceOf(Function)
    expect(filtered_val1).toBe('LIQUIDATING')
    expect(filtered_val2).toBe(null)
    expect(filtered_val3).toBe(null)
    expect(filtered_val4).toBe(null)
  })

  it('sets party_types processor', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let proc = model.processors['party_types']
    let filtered_val1 = proc('INDIVIDUAL')
    let filtered_val2 = proc('ANY_OTHER')
    let filtered_val3 = proc(null)
    let filtered_val4 = proc()

    expect(proc).toBeInstanceOf(Function)
    expect(filtered_val1).toBe('INDIVIDUAL')
    expect(filtered_val2).toBe(null)
    expect(filtered_val3).toBe(null)
    expect(filtered_val4).toBe(null)
  })

  it('sets allow modifier', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let mod = model.modifiers['allow']
    let filtered_val1 = mod(null, [null])
    let filtered_val2 = mod('ANY_OTHER', [null])
    let filtered_val3 = mod(1, [null])
    let filtered_val4 = mod(undefined, [null])

    expect(mod).toBeInstanceOf(Function)
    expect(filtered_val1).toEqual({ break: true })
    expect(filtered_val2).toEqual({ break: false })
    expect(filtered_val3).toEqual({ break: false })
    expect(filtered_val4).toEqual({ break: false })
  })

  it('sets default modifier', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let mod = model.modifiers['default']
    let filtered_val1 = mod(null, 5)
    let filtered_val2 = mod('ANY_OTHER', 5)
    let filtered_val3 = mod(1, 5)
    let filtered_val4 = mod(undefined, 5)
    let filtered_val5 = mod({ r: 3 }, 5)

    expect(mod).toBeInstanceOf(Function)
    expect(filtered_val1).toEqual({ value: 5 })
    expect(filtered_val2).toEqual({ value: 'ANY_OTHER' })
    expect(filtered_val3).toEqual({ value: 1 })
    expect(filtered_val4).toEqual({ value: 5 })
    expect(filtered_val5).toEqual({ value: { r: 3 } })
  })
})
