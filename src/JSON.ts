/**
 * Represntation of JSON parser and serializer
 */

export class _JSON {
  index: number = 0;

  /**
   * Parses JSON string into its coresponding Javascript value.
   * @param jsonStrings The JSON string to parse.
   * @returns
   */
  public static parse(jsonStrings: any) {
    const customJSON = new _JSON();
    const tokens = customJSON.tokenize(jsonStrings.toString());
    return customJSON.parseValue(tokens);
  }

  /**
   * Serializes a Javascript value into JSON string.
   * @param {unknown} tokens Javascript value to be serialize.
   * @returns {string} JSON string representation.
   */
  public static stringify(value: unknown): string {
    const customeJSON = new _JSON();
    return customeJSON.serializeValue(value);
  }

  /**
   * Tokenizes JSON string into array of tokens
   * @param jsonString The string JSONs to tokinze
   * @returns {Array<{ type: string; value: any }>} Array of token object
   */
  private tokenize(jsonString: string) {
    const tokens = [];
    let index = 0;

    while (index < jsonString.length) {
      let char = jsonString[index];

      // Skip whitespace characters
      if (/\s/.test(char)) {
        index++;
        continue;
      }

      if ("{}{}:,".includes(char)) {
        tokens.push({ type: "punctuation", value: char });
        index++;
        continue;
      }

      if (char === '"') {
        let stringValue = "";
        index++; // Move past the opening quote

        while (jsonString[index] !== '"') {
          stringValue += jsonString[index];
          index++;
        }

        if (index === length) {
          throw new SyntaxError("Unterminated string");
        }

        tokens.push({ type: "string", value: stringValue });
        index++; // Move past the closing quote
        continue;
      }

      if (/[\d-.]/.test(char)) {
        let numberValue = "";

        while (/[\d.eE+-]/.test(jsonString[index])) {
          numberValue += jsonString[index];
          index++;
        }

        tokens.push({ type: "number", value: parseFloat(numberValue) });
        continue;
      }

      // Handle true, false, null
      if (jsonString.startsWith("true", index)) {
        tokens.push({ type: "boolean", value: true });
        index += 4;
        continue;
      }

      if (jsonString.startsWith("false", index)) {
        tokens.push({ type: "boolean", value: false });
        index += 5;
        continue;
      }

      if (jsonString.startsWith("null", index)) {
        tokens.push({ type: "null", value: null });
        index += 4;
        continue;
      }

      // If none of the above, it's likely a syntax error in the JSON
      throw new SyntaxError("Unexpected character in JSON");
    }

    return tokens;
  }
  /**
   * Parses JSON tokens and returns the corresponding JavaScript value.
   * @param {Array<{ type: string; value: any }>} tokens - Array of token objects with 'type' and 'value' properties.
   * @returns {any} Parsed JavaScript value corresponding to the tokens.
   * @throws {SyntaxError} Throws an error if an unexpected character or token is encountered.
   */
  private parseValue(tokens: { type: string; value: any }[]) {
    const token = tokens[this.index];

    switch (token.type) {
      case "{":
        return this.parseObject(tokens);
      case "[":
        return this.parseArray(tokens);
      case '"':
        return this.parseString(tokens);
      case "t":
        return this.parseTrue(tokens);
      case "f":
        return this.parseFalse(tokens);

      default:
        if (/[\d-.]/.test(token.type)) {
          return this.parseNumber(tokens);
        } else {
          throw new SyntaxError("Unexpected character while parsing value");
        }
    }
  }

  private serializeValue(value: any): string {
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return this.serializeArray(value);
      } else if (value instanceof Date) {
        return `"${value.toISOString()}"`; // Serialize Date objects as ISO strings
      } else {
        return this.serializeObject(value);
      }
    } else if (typeof value === "string") {
      return this.serializeString(value);
    } else if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      return this.serializePrimitive(value);
    } else {
      // Handle other tokens datatypes (date, custom objects, etc.) accordingly
      return ""; // Placeholder for other tokens datatypes
    }
  }

  private serializeObject(obj: any): string {
    const keys = Object.keys(obj);
    const serializedKeys = keys.map(
      (key) => `"${key}":"${this.serializeValue(obj[key])}"`
    );
    return `${serializedKeys.join(", ")}`;
  }

  /**
   * Serializes a JavaScript array into a JSON array.
   * @param {any[]} arr - The JavaScript array to be serialized.
   * @returns {string} JSON string representation of the array.
   */
  private serializeArray(arr: any[]): string {
    const serializeValues = arr.map((value) => this.serializeValue(value));
    return `[${serializeValues.join(", ")}]`;
  }
  /**
   * Serializes a JavaScript string into a JSON string, escaping special characters.
   * @param {string} value - The JavaScript string to be serialized.
   * @returns {string} JSON string representation of the input string with escaped special characters.
   */
  private serializeString(value: string): string {
    // Replace special characters with their respective escape sequences
    const escapedValue = value.replace(
      /[\u0000-\u001F"\\]/g,
      (match: string) => {
        switch (match) {
          case '"':
            return '\\"'; // Escape double quote
          case "\\":
            return "\\\\"; // Escape backslash
          case "\b":
            return "\\b"; // Escape backspace
          case "\f":
            return "\\f"; // Escape form feed
          case "\n":
            return "\\n"; // Escape newline
          case "\r":
            return "\\r"; // Escape carriage return
          case "\t":
            return "\\t"; // Escape tab
          default:
            // For control characters and other special characters, escape as unicode
            return `\\u${("0000" + match.charCodeAt(0).toString(16)).slice(
              -4
            )}`;
        }
      }
    );

    return `"${escapedValue}"`;
  }

  /**
   * Serializes a JavaScript primitive into a JSON string.
   * @param {(number | boolean | null)} value - The JavaScript primitive to be serialized.
   * @returns {string} JSON string representation of the primitive.
   */
  private serializePrimitive(value: number | boolean | null): string {
    switch (value) {
      case null:
        return "null"; // Serialize null as 'null'
      case undefined:
        return "undefined"; // Serialize null as 'null'
      case typeof value === "boolean":
        return value ? "true" : "false"; // Serialize boolean as 'true' or 'false'
      case typeof value === "number":
        if (Number.isFinite(value)) {
          return `${value}`; // Serialize finite numbers as their string representation
        } else {
          throw new Error("Unsupported number value encountered."); // Throw error for non-finite numbers (NaN, Infinity, -Infinity)
        }
      case null:
        return "null";

      default:
        throw new Error("Unsupported value type encountered."); // Throw error for unsupported types (undefined, symbol, etc.)
    }
  }

  /**
   * Parses a JSON object from tokens.
   * @param {any[]} tokens - Array of token objects.
   * @returns {object} Parsed JavaScript object.
   */
  private parseObject(tokens: any[]) {
    const obj: { [key: string]: any } = {};

    if (tokens[this.index].value !== "{") {
      throw new SyntaxError("Invalid object structure");
    }

    this.index++;

    while (tokens[this.index]?.value !== "}") {
      const key = this.parseValue(tokens);
      if (typeof key !== "string") {
        String(key);
      }

      if (!key || tokens[this.index + 1]?.value !== ":") {
        throw new SyntaxError("Invalid object structure");
      }
      this.index++; // Move past key and ":"

      const value = this.parseValue(tokens);
      obj[key] = value;

      if (tokens[this.index]?.value === ",") {
        this.index++; // Move past ","
      } else if (tokens[this.index]?.value !== "}") {
        throw new SyntaxError("Missing closing brace for object");
      }
    }
    this.index++; // Move past the closing brace
    return obj;
  }
  /**
   * Parses a JSON string from tokens.
   * @param {any[]} tokens - Array of token objects.
   * @returns {string} Parsed JavaScript string.
   */
  private parseString(tokens: any[]) {
    if (tokens[this.index]?.type === "string") {
      const value = tokens[this.index]?.value;
      this.index++;
      return value;
    } else {
      throw new SyntaxError("Invalid string");
    }
  }

  /**
   * Parses a JSON array from tokens.
   * @param {any[]} tokens - Array of token objects.
   * @returns {any[]} Parsed JavaScript array.
   */
  private parseArray(tokens: any[]) {
    const arr: any[] = [];

    if (tokens[this.index].value !== "]") {
      throw new SyntaxError("Invlid array structure");
    }

    this.index++;

    while (tokens[this.index]?.value !== "]") {
      const value = this.parseValue(tokens);
      arr.push(value);
      if (tokens[this.index]?.value === ",") {
        this.index++; // Move past ","
      }
    }
    if (tokens[this.index]?.value !== "]") {
      throw new SyntaxError("Missing closing bracket for array");
    }

    this.index++; // Move past the closing bracket
    return arr;
  }
  /**
   * Parses a JSON true value from tokens.
   * @param {any[]} tokens - Array of token objects.
   * @returns {boolean} Parsed JavaScript true value.
   */
  private parseTrue(tokens: any[]) {
    if (tokens[this.index]?.value === "true") {
      this.index++;
      return true;
    }
    throw new SyntaxError("Invalid true value");
  }
  /**
   * Parses a JSON false value from tokens.
   * @param {any[]} tokens - Array of token objects.
   * @returns {boolean} Parsed JavaScript false value.
   */
  private parseFalse(tokens: any[]) {
    if (tokens[this.index]?.value === "false") {
      this.index++;
      return false;
    }
    throw new SyntaxError("Invalid false value");
  }
  /**
   * Parses a JSON number from tokens.
   * @param {any[]} tokens - Array of token objects.
   * @returns {number} Parsed JavaScript number.
   */
  private parseNumber(tokens: any[]) {
    const tokenValue = tokens[this.index].value;
    const num = Number(tokenValue);

    if (isNaN(num)) {
      throw new SyntaxError("Invalid number");
    }

    // Validate if the token value matches the JSON number format
    const isValidJSONNumber =
      /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(tokenValue);

    if (!isValidJSONNumber) {
      throw new SyntaxError("Invalid JSON number format");
    }

    this.index++;
    return num;
  }
}
