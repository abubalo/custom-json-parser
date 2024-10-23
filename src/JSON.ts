type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray | Date;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const enum TokenType {
  LeftBrace = "{",
  RightBrace = "}",
  LeftBracket = "[",
  RightBracket = "]",
  Colon = ":",
  Comma = ",",
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Null = "null",
  Date = "date",
}

interface Token {
  type: TokenType;
  value: string | number | boolean | null | Date;
  position: number;
}

interface ParserOptions {
  reviver?: (key: string, value: any) => any;
  dateParser?: (value: string) => Date | null;
}

interface StringifyOptions {
  replacer?: (key: string, value: any) => any;
  space?: string | number;
  dateSerializer?: (date: Date) => string;
}

class JSONParseError extends Error {
  constructor(message: string, public position: number) {
    super(`${message} at position ${position}`);
    this.name = "JSONParseError";
  }
}

export class _JSON {
  private static readonly NUMBER_PATTERN =
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
  private static readonly ESCAPE_MAP: Record<string, string> = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };

  private position = 0;
  private input = "";
  private tokens: Token[] = [];
  private currentToken = 0;

  public static parse(text: string, options: ParserOptions = {}): JsonValue {
    const parser = new _JSON();
    return parser.parse(text, options);
  }

  public static stringify(
    value: JsonValue,
    options: StringifyOptions = {}
  ): string {
    const parser = new _JSON();
    return parser.stringify(value, options);
  }

  private parse(text: string, options: ParserOptions): JsonValue {
    this.input = text;
    this.position = 0;
    this.tokens = this.tokenize();

    const value = this.parseValue();

    if (options.reviver) {
      const reviverWrapper = (obj: any) => {
        const stack: any[] = [{ "": obj }];
        const keys: string[] = [""];

        while (stack.length > 0) {
          const parent = stack[stack.length - 1];
          const key = keys[keys.length - 1];
          let value = parent[key];

          if (value && typeof value === "object") {
            const entries = Object.entries(value);
            if (entries.length > 0) {
              const [nextKey, nextValue] = entries[0];
              delete value[nextKey];
              stack.push(value);
              keys.push(nextKey);
              parent[key] = options.reviver!(nextKey, nextValue);
              continue;
            }
          }

          stack.pop();
          keys.pop();
          if (stack.length > 0) {
            const parentKey = keys[keys.length - 1];
            stack[stack.length - 1][parentKey] = options.reviver!(key, value);
          }
        }

        return obj;
      };

      return reviverWrapper(value);
    }

    return value;
  }

  private tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      const char = this.input[this.position];

      // Skip whitespace
      if (/\s/.test(char)) {
        this.position++;
        continue;
      }

      if (this.isStructuralChar(char)) {
        tokens.push(this.tokenizeStructural());
        continue;
      }

      if (char === '"') {
        tokens.push(this.tokenizeString());
        continue;
      }

      if (this.isNumberStart(char)) {
        tokens.push(this.tokenizeNumber());
        continue;
      }

      if (this.isLiteralStart(char)) {
        tokens.push(this.tokenizeLiteral());
        continue;
      }

      throw new JSONParseError(`Unexpected character '${char}'`, this.position);
    }

    return tokens;
  }

  private tokenizeStructural(): Token {
    const char = this.input[this.position];
    const token: Token = {
      type: char as TokenType,
      value: char,
      position: this.position,
    };
    this.position++;
    return token;
  }

  private tokenizeString(): Token {
    const startPos = this.position;
    let value = "";
    this.position++; // Skip opening quote

    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === "\\") {
        this.position++;
        value += this.handleEscapeSequence();
      } else if (char === '"') {
        this.position++;
        return {
          type: TokenType.String,
          value,
          position: startPos,
        };
      } else {
        value += char;
        this.position++;
      }
    }

    throw new JSONParseError("Unterminated string", startPos);
  }

  private tokenizeNumber(): Token {
    const startPos = this.position;
    let numberStr = "";

    while (
      this.position < this.input.length &&
      this.isNumberChar(this.input[this.position])
    ) {
      numberStr += this.input[this.position];
      this.position++;
    }

    if (!_JSON.NUMBER_PATTERN.test(numberStr)) {
      throw new JSONParseError("Invalid number format", startPos);
    }

    const value = parseFloat(numberStr);
    if (!Number.isFinite(value)) {
      throw new JSONParseError("Invalid number value", startPos);
    }

    return {
      type: TokenType.Number,
      value,
      position: startPos,
    };
  }

  private tokenizeLiteral(): Token {
    const startPos = this.position;
    const literals = {
      true: { type: TokenType.Boolean, value: true },
      false: { type: TokenType.Boolean, value: false },
      null: { type: TokenType.Null, value: null },
    };

    for (const [literal, token] of Object.entries(literals)) {
      if (this.input.startsWith(literal, this.position)) {
        this.position += literal.length;
        return { ...token, position: startPos };
      }
    }

    throw new JSONParseError("Invalid literal", startPos);
  }

  private parseValue(): JsonValue {
    const token = this.tokens[this.currentToken];

    switch (token.type) {
      case TokenType.LeftBrace:
        return this.parseObject();
      case TokenType.LeftBracket:
        return this.parseArray();
      case TokenType.String:
      case TokenType.Number:
      case TokenType.Boolean:
      case TokenType.Null:
        this.currentToken++;
        return token.value as JsonValue;
      default:
        throw new JSONParseError("Unexpected token", token.position);
    }
  }

  private parseObject(): JsonObject {
    const obj: JsonObject = {};
    this.currentToken++; // Skip the first opening curly brace'{'

    while (this.currentToken < this.tokens.length) {
      if (this.tokens[this.currentToken].type === TokenType.RightBrace) {
        this.currentToken++;
        return obj;
      }

      const keyToken = this.tokens[this.currentToken];
      if (keyToken.type !== TokenType.String) {
        throw new JSONParseError(
          "Object key must be a string",
          keyToken.position
        );
      }
      const key = keyToken.value as string;
      this.currentToken++;

      const colonToken = this.tokens[this.currentToken];
      if (colonToken.type !== TokenType.Colon) {
        throw new JSONParseError('Expected ":"', colonToken.position);
      }
      this.currentToken++;

      obj[key] = this.parseValue();

      const nextToken = this.tokens[this.currentToken];
      if (nextToken.type === TokenType.Comma) {
        this.currentToken++;
      } else if (nextToken.type !== TokenType.RightBrace) {
        throw new JSONParseError('Expected "," or "}"', nextToken.position);
      }
    }

    throw new JSONParseError("Unterminated object", this.tokens[0].position);
  }

  private parseArray(): JsonArray {
    const arr: JsonArray = [];
    this.currentToken++; // Skip '['

    while (this.currentToken < this.tokens.length) {
      if (this.tokens[this.currentToken].type === TokenType.RightBracket) {
        this.currentToken++;
        return arr;
      }

      arr.push(this.parseValue());

      const nextToken = this.tokens[this.currentToken];
      if (nextToken.type === TokenType.Comma) {
        this.currentToken++;
      } else if (nextToken.type !== TokenType.RightBracket) {
        throw new JSONParseError('Expected "," or "]"', nextToken.position);
      }
    }

    throw new JSONParseError("Unterminated array", this.tokens[0].position);
  }

  private stringify(value: JsonValue, options: StringifyOptions): string {
    const indent = this.resolveIndent(options.space);
    return this.stringifyValue(value, options, indent, 0);
  }

  private stringifyValue(
    value: JsonValue,
    options: StringifyOptions,
    indent: string,
    level: number
  ): string {
    if (value === null) return "null";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "number") return this.stringifyNumber(value);
    if (typeof value === "string") return this.stringifyString(value);
    if (value instanceof Date) {
      return options.dateSerializer
        ? options.dateSerializer(value)
        : `"${value.toISOString()}"`;
    }
    if (Array.isArray(value)) {
      return this.stringifyArray(value, options, indent, level);
    }
    return this.stringifyObject(value as JsonObject, options, indent, level);
  }

  private isStructuralChar(char: string): boolean {
    return "{[]}:,".includes(char);
  }

  private isNumberStart(char: string): boolean {
    return /[-0-9]/.test(char);
  }

  private isNumberChar(char: string): boolean {
    return /[-0-9.eE+]/.test(char);
  }

  private isLiteralStart(char: string): boolean {
    return /[tfn]/.test(char);
  }

  private handleEscapeSequence(): string {
    const char = this.input[this.position];
    if (char === "u") {
      const sequence = this.input.slice(this.position + 1, this.position + 5);
      if (!/^[0-9a-fA-F]{4}$/.test(sequence)) {
        throw new JSONParseError(
          "Invalid Unicode escape sequence",
          this.position - 1
        );
      }
      this.position += 5;
      return String.fromCharCode(parseInt(sequence, 16));
    }

    const escaped = _JSON.ESCAPE_MAP[char];
    if (!escaped) {
      throw new JSONParseError("Invalid escape sequence", this.position - 1);
    }
    this.position++;
    return escaped;
  }

  private stringifyNumber(num: number): string {
    return Number.isFinite(num) ? String(num) : "null";
  }

  private stringifyString(str: string): string {
    return `"${str.replace(/[\u0000-\u001f"\\]/g, (char) => {
      const escaped = _JSON.ESCAPE_MAP[char];
      return (
        escaped || `\\u${("0000" + char.charCodeAt(0).toString(16)).slice(-4)}`
      );
    })}"`;
  }

  private stringifyArray(
    arr: JsonArray,
    options: StringifyOptions,
    indent: string,
    level: number
  ): string {
    if (arr.length === 0) return "[]";

    const items = arr.map(
      (item) =>
        `${indent.repeat(level + 1)}${this.stringifyValue(
          item,
          options,
          indent,
          level + 1
        )}`
    );

    return ["[", items.join(",\n"), `${indent.repeat(level)}]`].join("\n");
  }

  private stringifyObject(
    obj: JsonObject,
    options: StringifyOptions,
    indent: string,
    level: number
  ): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";

    const items = entries.map(
      ([key, value]) =>
        `${indent.repeat(level + 1)}${this.stringifyString(key)}: ` +
        this.stringifyValue(value, options, indent, level + 1)
    );

    return ["{", items.join(",\n"), `${indent.repeat(level)}}`].join("\n");
  }

  private resolveIndent(space: string | number | undefined): string {
    if (typeof space === "number") {
      return " ".repeat(Math.max(0, Math.min(10, Math.floor(space))));
    }
    if (typeof space === "string") {
      return space.slice(0, 10);
    }
    return "";
  }
}
