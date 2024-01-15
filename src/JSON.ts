const TOKEN_TYPES = {
  Punctuation: "punctuation",
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Null: "null",
  Date: "date",
  Binary: "binary",
} as const;

type Token<T = any> = {
  type: string;
  value: T;
};

export class _JSON {
  private currentPosition: number = 0;

  private static createInstance(): _JSON {
    return new _JSON();
  }

  public static parse(jsonStrings: any, callback?: () => void): _JSON {
    const customJSON = _JSON.createInstance();
    const tokens = customJSON.tokenize(jsonStrings);
    return customJSON.parseValue(tokens);
  }

  public static stringify(value: unknown, callback?: () => void): string {
    const customJSON = _JSON.createInstance();
    return customJSON.serializeValue(value);
  }

  private tokenize(jsonString: string) {
    const tokens = [];
    let currentPosition = 0;

    while (currentPosition < jsonString.length) {
      let char = jsonString[currentPosition];

      // Skip whitespace characters
      if (/\s/.test(char)) {
        currentPosition++;
        continue;
      }

      if ("[]{},:".includes(char)) {
        tokens.push({ type: TOKEN_TYPES.Punctuation, value: char });
        currentPosition++;
        continue;
      }

      if (char === '"') {
        let stringValue = "";
        currentPosition++; // Move past the opening quote

        while (jsonString[currentPosition] !== '"') {
          stringValue += jsonString[currentPosition];
          currentPosition++;
        }

        if (currentPosition === jsonString.length) {
          throw new SyntaxError(`Unterminated string at position ${currentPosition}`);
        }

        tokens.push({ type: TOKEN_TYPES.String, value: stringValue });
        currentPosition++; // Move past the closing quote
        continue;
      }

      if (/[\d-.]/.test(char)) {
        let numberValue = "";

        while (/[\d.eE+-]/.test(jsonString[currentPosition])) {
          numberValue += jsonString[currentPosition];
          currentPosition++;
        }

        tokens.push({
          type: TOKEN_TYPES.Number,
          value: parseFloat(numberValue),
        });
        continue;
      }

      // Handle true, false, null
      if (jsonString.startsWith("true", currentPosition)) {
        tokens.push({ type: TOKEN_TYPES.Boolean, value: true });
        currentPosition += 4;
        continue;
      }

      if (jsonString.startsWith("false", currentPosition)) {
        tokens.push({ type: TOKEN_TYPES.Boolean, value: false });
        currentPosition += 5;
        continue;
      }

      if (jsonString.startsWith("null", currentPosition)) {
        tokens.push({ type: TOKEN_TYPES.Null, value: null });
        currentPosition += 4;
        continue;
      }

      // If none of the above, it's likely a syntax error in the JSON
      throw new SyntaxError(`Unexpected character: ${char} at position ${currentPosition} in JSON`);
    }

    return tokens;
  }

  private parseValue(tokens: Array<Token>) {
    const token = tokens[this.currentPosition];

    switch (token.type) {
      case TOKEN_TYPES.Punctuation:
        return this.parsePunctuation(tokens);
      case TOKEN_TYPES.String:
        return this.parseString(tokens);
      case TOKEN_TYPES.Number:
        return this.parseNumber(tokens);
      case TOKEN_TYPES.Boolean:
        return this.parseBoolean(tokens);
      case TOKEN_TYPES.Null:
        return this.parseNull();
      default:
        throw new SyntaxError("Unexpected token type while parsing value");
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
      (key) => `"${key}": ${this.serializeValue(obj[key])}`
    );
    return `{${serializedKeys.join(", ")}}`;
  }

  private serializeArray(arr: any[]): string {
    const serializeValues = arr.map((value) => this.serializeValue(value));
    return `[${serializeValues.join(", ")}]`;
  }

  private serializeString(value: string): string {
    const escapeChars: Record<string, string> = {
      '"': '\\"',
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "\t": "\\t",
    };

    const escapedValue = value.replace(
      /[\u0000-\u001F"\\]/g,
      (match) =>
        escapeChars[match] ||
        `\\u${("0000" + match.charCodeAt(0).toString(16)).slice(-4)}`
    );
    return `"${escapedValue}"`;
  }

  private serializePrimitive(value: number | boolean | null): string {
    // return `${value}`;

    switch (value) {
      case null:
        return "null"; // Serialize null as 'null'
      case true:
        return "true"; // Serialize boolean true as 'true'
      case false:
        return "false"; // Serialize boolean false as 'false'
      default:
        return `${value}`; // Serialize finite numbers as their string representation
    }
  }

  private serializeDate(value: Date) {
    //Todo: Implement Date serialization
  }

  private parsePunctuation(tokens: Array<Token>) {
    const value: any = tokens[this.currentPosition].value;
    if (value === "[") {
      return this.parseArray(tokens);
    } else if (value === "{") {
      return this.parseObject(tokens);
    }
  }

  private parseBoolean(tokens: Array<Token>): boolean {
    const value = tokens[this.currentPosition].value;

    if (typeof value === "boolean") {
      this.currentPosition++;
      return value;
    }

    if (typeof value === "string") {
      const isTrue = value.startsWith("true");
      const isFalse = value.startsWith("false");

      if (isTrue || isFalse) {
        this.currentPosition++;
        return isTrue;
      }

      throw new SyntaxError("Invalid boolean value");
    }

    throw new SyntaxError("Invalid boolean value");
  }


  private parseNull() {
    this.currentPosition++;
    return null;
  }

  private parseObject(tokens: any[]) {
    const obj: { [key: string]: any } = {};

    if (tokens[this.currentPosition].value !== "{") {
      throw new SyntaxError("Invalid object structure");
    }

    this.currentPosition++; // Move past the opening brace

    while (tokens[this.currentPosition].value !== "}") {
      // Parse key
      const key = this.parseValue(tokens);

      if (
        typeof key !== "string" ||
        tokens[this.currentPosition].value !== ":"
      ) {
        throw new SyntaxError("Invalid object structure");
      }

      this.currentPosition++; // Move past the key and ":"

      // Parse value
      const value = this.parseValue(tokens);
      obj[key] = value;

      if (tokens[this.currentPosition].value === ",") {
        this.currentPosition++; // Move past the ","
      } else if (tokens[this.currentPosition].value !== "}") {
        throw new SyntaxError("Missing comma after key");
      }
    }

    this.currentPosition++; // Move past the closing brace
    return obj;
  }

  private parseString(tokens: any[]) {
    if (tokens[this.currentPosition].type === TOKEN_TYPES.String) {
      const value = tokens[this.currentPosition].value;
      this.currentPosition++;
      return value;
    } else {
      throw new SyntaxError("Invalid string");
    }
  }

  private parseArray(tokens: any[]) {
    const arr: any[] = [];

    if (tokens[this.currentPosition].value !== "[") {
      throw new SyntaxError("Invlid array structure");
    }

    this.currentPosition++;

    while (tokens[this.currentPosition].value !== "]") {
      const value = this.parseValue(tokens);
      arr.push(value);
      if (tokens[this.currentPosition].value === ",") {
        this.currentPosition++; // Move past ","
      }
    }
    if (tokens[this.currentPosition].value !== "]") {
      throw new SyntaxError("Missing closing bracket for array");
    }

    this.currentPosition++; // Move past the closing bracket
    return arr;
  }

  private parseNumber(tokens: any[]) {
    const tokenValue = tokens[this.currentPosition].value;
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

    this.currentPosition++;
    return num;
  }
}
