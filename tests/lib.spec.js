import DaDataJS from '../'

describe('dadata-js', () => {
  const token = '278908b74c6a3a5433aaec7c7364a38420722c05';
  const dadata = new DaDataJS(token)

  it('is created from class', () => {
    expect(dadata.model).toBeTruthy()
    expect(dadata.model.token).toBe(token)
    expect(dadata.token).toBe(token)
    expect(dadata.suggestions.length).toBe(0)
  })

  it('fetches suggestions', async () => {
    dadata.model.interceptor = (response) => {
      console.log("City: ", response)
    }

    try {
      const suggestions = await dadata.suggest('address', 'г Каз')
      expect(suggestions).toEqual(dadata.suggestions)
      // expect(suggestions).toContain('г Казань')

    } catch (e) {
      console.log("ERRRORRRR: ", e)
    }
  })
})
