import { JSON } from '../src/JSON'; // Replace with the correct path to your JSON class file

describe('JSON Class', () => {
  describe('parse method', () => {
    it('should parse a valid JSON string into corresponding JavaScript value', () => {
      const jsonString = '{"key": "value", "array": [1, 2, 3]}';
      const parsedValue = JSON.parse(jsonString);
      const expectedValue = { key: 'value', array: [1, 2, 3] };
      expect(parsedValue).toEqual(expectedValue);
    });

    it('should throw a SyntaxError for an invalid JSON string', () => {
      const invalidJsonString = '{ key: "value" }'; // Invalid JSON due to key without quotes
      expect(() => JSON.parse(invalidJsonString)).toThrow(SyntaxError);
    });
  });

  describe('stringify method', () => {
    it('should serialize a JavaScript value into a valid JSON string', () => {
      const javascriptValue = { key: 'value', array: [1, 2, 3] };
      const serializedString = JSON.stringify(javascriptValue);
      const expectedString = '{"key":"value","array":[1,2,3]}';
      expect(serializedString).toEqual(expectedString);
    });
  });

  // Add more tests as needed for different scenarios and edge cases
});
