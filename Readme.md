# Custom JSON Serialization 

This library provides a custom implementation of JSON serialization in TypeScript. It extends the standard JSON functionality to support additional data types, including Date and Time.

## Features

Custom JSON stringify and parse methods:
- Serialize and deserialize data structures to and from JSON format.
- Support for Date and Time: Handle Date and Time objects without any loss of precision.
- TypeScript type safety: Ensures type safety throughout the serialization and deserialization process.
- User-friendly API: Easy-to-understand and use functions for serializing and deserializing data.

```ts
import { JSONSerialization } from 'json-serialization-ts';

// Serialization example
const obj: { name: string; age: number; dob: Date } = {
  name: 'John Doe',
  age: 30,
  dob: new Date('1992-10-01'),
};

const serializedData = JSONSerialization.stringify(obj);
console.log(serializedData); // Output: '{"name":"John Doe","age":30,"dob":"1992-10-01"}'

// Deserialization example
const deserializedData = JSONSerialization.parse(serializedData);
console.log(deserializedData); // Output: { name: 'John Doe', age: 30, dob: Date('1992-10-01') }
```

## Supported Data Types


### Primitive types 
- Numbers
- Strings
- Booleans
### Primitive types
- Arrays
- Objects
- Date and Time
- Binary Data Support

Binary data support is not currently implemented, but it may be added in future versions of the library.


## License
This library is licensed under the [MIT](/LICENSE) License.