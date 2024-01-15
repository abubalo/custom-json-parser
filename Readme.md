# Custom JSON Data Serializer

This project serves as a personal learning experience to explore the inner workings of JSON data serialization. It aims to implement a custom JSON serialization mechanism from scratch.

<!-- , extending its functionality to support additional data types like Date and Time. -->

## Objectives

- Conceptual Understanding: Gain a comprehensive understanding of JSON data serialization principles and techniques.
- Implementation Skills: Develop practical skills in implementing a custom JSON serialization library using TypeScript.
- Data Type Handling: Explore the handling and representation of various data types, including primitives, arrays, objects, Date, and Time.

## Learning Outcomes

Upon completion of this project, I should have a clear understanding of:

- The JSON data format and its structure
- The process of data serialization and deserialization
- Implementing custom serialization and deserialization functions
- Handling various data types in JSON serialization
- Utilizing TypeScript's type system for data integrity

## Project Scope

This project focuses on implementing a custom JSON serialization mechanism in TypeScript, with a primary focus on understanding the underlying concepts and techniques.

<!-- It extends the standard JSON functionality to support Date and Time data types. -->

## Future Enhancements

While the project's primary goal is learning-oriented, potential future enhancements could include:

- Performance Optimization: Optimizing the serialization and deserialization routines for enhanced performance.
- Extensive Testing: Implementing comprehensive unit and integration tests to ensure the program's correctness and reliability.
- Binary Data Support: Exploring the feasibility of incorporating binary data support in future iterations.
  Conclusion
- Date Support: Enhancing the serializer and parser to incorporate comprehensive date handling capabilities.
- Undefine Support: Exploring strategies to effectively manage undefined or null data states within the serialization and parsing processes, aiming for robust handling and representation of such data conditions.
- Comment Support: Implementing a user-friendly feature enabling contextual comments within the serialized JSON.

## Features

Custom JSON stringify and parse methods:

- Serialize and deserialize data structures to and from JSON format.
- Support for Date and Time: Handle Date and Time objects without any loss of precision.
- TypeScript type safety: Ensures type safety throughout the serialization and deserialization process.
- User-friendly API: Easy-to-understand and use functions for serializing and deserializing data.

## Example

```ts
import { _JSON } from "./JSON";

// Serialization example
const obj = {
  name: "John Doe",
  age: 30,
  gender: "Male",
};

const serializedData = _JSON.stringify(obj);
console.log(serializedData); // Output: '{"name":"John Doe", "age": 30 "gender": "Male"}'

// Deserialization example
const deserializedData = _JSON.parse(serializedData);
console.log(deserializedData); // Output: { name: "John Doe", age: 30 gender: "Male" }
```

## Supported Data Types

### Primitive types

- Number
- String
- Boolean
- Null

### Non-Primitive types

- Array
- Object
<!-- - Date and Time
- Binary Data Support -->

<!-- Binary data support is not currently implemented, but it may be added in future versions of the library. -->

## License

This library is licensed under the [MIT](/LICENSE) License.
