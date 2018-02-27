import DaDataJS from '../'

describe('dadata-js', () => {
  const token = '5ef98f5781a106962077fb18109095f9f11ebac1';
  const dadata = new DaDataJS(token)

  it('is created from class', () => {
    expect(dadata.model).toBeTruthy()
    expect(dadata.model.token).toBe(token)
    expect(dadata.token).toBe(token)
    expect(dadata.suggestions.length).toBe(0)
  })

  it('fetches suggestions', async () => {
    const suggestions = await dadata.suggest('address', 'г Каз')

    expect(suggestions).toEqual(dadata.suggestions)
    expect(suggestions).toContain('г Казань')
  })
})
