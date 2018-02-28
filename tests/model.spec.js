import DaDataModel from '../models/dadata'
import polyfills from '../polyfills'

describe('DaDataModel', () => {
  it('sets token', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(model.token).toBe('asdasdasd')
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

  it('sends suggest query', async () => {
    const model = new DaDataModel(null, 'asdasdasd')

    model.interceptor = (resp) => {
      console.log('HEADERS', model.headers)
      console.log('INTER', resp)
    }

    try {
      let res = await model.suggest('address', { query: 'Казань', count: 5 })
      console.log('RES', res)
    } catch (e) {
      console.log('Error', e)
    }

    // expect(res).toHaveProperty('suggestions')
  })

  it('sets bound processor', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let bound_proc = model.processors['bound']
    let filtered_val1 = bound_proc({})
    let filtered_val2 = bound_proc({ value: null })
    let filtered_val3 = bound_proc(null)
    let filtered_val4 = bound_proc({ value: 123 })

    expect(bound_proc).toBeInstanceOf(Function)
    expect(filtered_val1).toBe(null)
    expect(filtered_val2).toBe(null)
    expect(filtered_val3).toBe(null)
    expect(filtered_val4).toEqual({ value: 123 })
  })

  it('sets party_status processor', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let party_status_proc = model.processors['party_status']
    let filtered_val1 = party_status_proc('LIQUIDATING')
    let filtered_val2 = party_status_proc('ANY_OTHER')
    let filtered_val3 = party_status_proc(null)
    let filtered_val4 = party_status_proc()

    expect(party_status_proc).toBeInstanceOf(Function)
    expect(filtered_val1).toBe('LIQUIDATING')
    expect(filtered_val2).toBe(null)
    expect(filtered_val3).toBe(null)
    expect(filtered_val4).toBe(null)
  })

  it('sets party_types processor', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let party_types_proc = model.processors['party_types']
    let filtered_val1 = party_types_proc('INDIVIDUAL')
    let filtered_val2 = party_types_proc('ANY_OTHER')
    let filtered_val3 = party_types_proc(null)
    let filtered_val4 = party_types_proc()

    expect(party_types_proc).toBeInstanceOf(Function)
    expect(filtered_val1).toBe('INDIVIDUAL')
    expect(filtered_val2).toBe(null)
    expect(filtered_val3).toBe(null)
    expect(filtered_val4).toBe(null)
  })

  it('sets allow modifier', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let allow_mod = model.modifiers['allow']
    let filtered_val1 = allow_mod(null, [null])
    let filtered_val2 = allow_mod('ANY_OTHER', [null])
    let filtered_val3 = allow_mod(1, [null])
    let filtered_val4 = allow_mod(undefined, [null])

    expect(allow_mod).toBeInstanceOf(Function)
    expect(filtered_val1).toEqual({ break: true })
    expect(filtered_val2).toEqual({ break: false })
    expect(filtered_val3).toEqual({ break: false })
    expect(filtered_val4).toEqual({ break: false })
  })

  it('sets default modifier', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    let default_mod = model.modifiers['default']
    let filtered_val1 = default_mod(null, 5)
    let filtered_val2 = default_mod('ANY_OTHER', 5)
    let filtered_val3 = default_mod(1, 5)
    let filtered_val4 = default_mod(undefined, 5)
    let filtered_val5 = default_mod({ r: 3 }, 5)

    expect(default_mod).toBeInstanceOf(Function)
    expect(filtered_val1).toEqual({ value: 5 })
    expect(filtered_val2).toEqual({ value: 'ANY_OTHER' })
    expect(filtered_val3).toEqual({ value: 1 })
    expect(filtered_val4).toEqual({ value: 5 })
    expect(filtered_val5).toEqual({ value: { r: 3 } })
  })
})
