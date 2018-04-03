import '../polyfills'
import DaDataJS from '../'

describe('dadata-js', () => {
  const token = process.env.TOKEN;
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
    expect(suggestions.length).toBeGreaterThan(0)

    const result = suggestions.find(s => s.value === 'г Казань');
    expect(result).toBeTruthy();
  })

  // CI doesn't allow IP detection.
  // it('fetches ip', async () => {
  //   const result = await dadata.detectAddressByIP();
  //   expect(result.location).toBeTruthy();
  //   expect(result.location.data).toBeTruthy();
  // })
})
