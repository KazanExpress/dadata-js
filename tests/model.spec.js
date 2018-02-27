import DaDataModel from '../models/dadata'

describe('DaDataModel', () => {
  it('sets token', () => {
    const model = new DaDataModel(null, 'asdasdasd')

    expect(model.token).toBe('asdasdasd')
  })
})
