import DaDataModel from '../models/dadata'

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
})
