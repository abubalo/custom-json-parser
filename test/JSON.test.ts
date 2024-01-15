import { _JSON } from '../src/JSON'; // Replace with the correct path to your JSON class file

describe('JSON Class', () => {
  describe('parse method', () => {
    it('should parse a valid JSON string into corresponding JavaScript value', () => {
      const jsonString = '{"key": "value", "array": [1, 2, 3]}';
      const parsedValue = _JSON.parse(jsonString);
      const expectedValue = { key: 'value', array: [1, 2, 3] };
      expect(parsedValue).toEqual(expectedValue);
    });

    it('should throw a SyntaxError for an invalid JSON string', () => {
      const invalidJsonString = '{"key": "value"}'; // Invalid JSON due to key without quotes
      expect(() => _JSON.parse(invalidJsonString)).toThrow(SyntaxError);
    });
  });

  describe('stringify method', () => {
    it('should serialize a JavaScript value into a valid JSON string', () => {
      const javascriptValue = { key: 'value', array: [1, 2, 3] };
      const serializedString = _JSON.stringify(javascriptValue);
      const expectedString = '{"key":"value","array":[1,2,3]}';
      expect(serializedString).toEqual(expectedString);
    });
  });

  it('should handle empty JSON object and array', () => {
    const emptyObjectString = '{}';
    const parsedEmptyObject = _JSON.parse(emptyObjectString);
    const serializedEmptyObject = _JSON.stringify(parsedEmptyObject);
    expect(serializedEmptyObject).toEqual(emptyObjectString);

    const emptyArrayString = '[]';
    const parsedEmptyArray = _JSON.parse(emptyArrayString);
    const serializedEmptyArray = _JSON.stringify(parsedEmptyArray);
    expect(serializedEmptyArray).toEqual(emptyArrayString);
  });

  it('should handle edge cases of whitespace characters', () => {
    const jsonStringWithWhitespace = '   {   "key"   :   "value"   }   ';
    const parsedObject = _JSON.parse(jsonStringWithWhitespace);
    const serializedString = _JSON.stringify(parsedObject);
    const expectedString = '{"key":"value"}';
    expect(serializedString).toEqual(expectedString);
  });

  it('should handle very large numbers', () => {
    const largeNumberString = '{"largeNumber": 12345678901234567890}';
    const parsedObject = _JSON.parse(largeNumberString);
    const serializedString = _JSON.stringify(parsedObject);
    const expectedString = '{"largeNumber":12345678901234567890}';
    expect(serializedString).toEqual(expectedString);
  });

  it('should handle null values and undefined keys', () => {
    const jsonString = '{"key1": null, "key2": undefined}';
    const parsedObject = _JSON.parse(jsonString);
    const serializedString = _JSON.stringify(parsedObject);
    const expectedString = '{"key1":null}';
    expect(serializedString).toEqual(expectedString);
  });
});
