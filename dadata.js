export default class {
  constructor(API_KEY, SECRET_KEY) {
    this.apiKey = API_KEY;
  }

  apiKey
  suggestions = []

  clear();
  clearCache();
  clearSuggestions();

  getGeoLocation();
  fixData(text);
  setOptions(options);
  setSuggestion(suggestion);
}