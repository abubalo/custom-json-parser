export class JSON<T> {
  index: number = 0;

  public static parse(jsonStrings: string) {
    const tokens = new JSON().tokenize(jsonStrings);
    return new JSON().parseValue(tokens);
  }

  public static strigify(tokens: unknown): string {
    return new JSON().serializeValue(tokens);
  }

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

      if (
        char === "{" ||
        char === "}" ||
        char === "[" ||
        char === "]" ||
        char === "," ||
        char === ":"
      ) {
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
    let result = "{";
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = obj[key];
      if (i > 0) {
        result += ",";
      }
      result += `"${key}":${this.serializeValue(value)}`;
    }
    result += "}";
    return result;
  }

  private serializeArray(arr: any[]): string {
    let result = "[";
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) {
        result += ",";
      }
      result += this.serializeValue(arr[i]);
    }
    result += "]";
    return result;
  }

  private serializeString(value: string): string {
    // Implement string serialization (escaping characters if needed)
    return `"${value}"`;
  }

  private serializePrimitive(value: number | boolean | null): string {
    // Serialize numbers, booleans, and null
    return `${value}`;
  }

  private parseObject(tokens: any[]) {
    const obj: { [key: string]: any } = {};
    if (tokens[this.index] === "{") {
      this.index++;
      while (tokens[this.index]?.value !== "}") {
        const key = tokens[this.index]?.value;
        if (!key || tokens[this.index + 1]?.value !== ":") {
          throw new SyntaxError("Invalid object structure");
        }
        this.index += 2; // Move past key and ":"
        const value = this.parseValue(tokens);
        obj[key] = value;
        if (tokens[this.index]?.value === ",") {
          this.index++; // Move past ","
        }
      }
      if (tokens[this.index]?.value !== "}") {
        throw new SyntaxError("Missing closing brace for object");
      }
      this.index++; // Move past the closing brace
      return obj;
    } else {
      throw new SyntaxError("Invalid object structure");
    }
  }

  private parseString(tokens: any[]) {
    if (tokens[this.index]?.type === "string") {
      const value = tokens[this.index]?.value;
      this.index++;
      return value;
    } else {
      throw new SyntaxError("Invalid string");
    }
  }

  private parseArray(tokens: any[]) {
    const arr: any[] = [];
    if (tokens[this.index] === "[") {
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
    } else {
      throw new SyntaxError("Invalid array structure");
    }
  }

  private parseTrue(tokens: any[]) {
    if (tokens[this.index]?.value === "true") {
      this.index++;
      return true;
    } else {
      throw new SyntaxError("Invalid true value");
    }
  }

  private parseFalse(tokens: any[]) {
    if (tokens[this.index]?.value === "false") {
      this.index++;
      return false;
    } else {
      throw new SyntaxError("Invalid false value");
    }
  }

  private parseNumber(tokens: any[]) {
    if (tokens[this.index]?.type === "number") {
      const value = tokens[this.index]?.value;
      this.index++;
      return value;
    } else {
      throw new SyntaxError("Invalid number");
    }
  }
}
