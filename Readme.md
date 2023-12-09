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
- Extensive Testing: Implementing comprehensive unit and integration tests to ensure the library's correctness and reliability.
- Binary Data Support: Exploring the feasibility of incorporating binary data support in future iterations.
Conclusion

## Features

Custom JSON stringify and parse methods:
- Serialize and deserialize data structures to and from JSON format.
- Support for Date and Time: Handle Date and Time objects without any loss of precision.
- TypeScript type safety: Ensures type safety throughout the serialization and deserialization process.
- User-friendly API: Easy-to-understand and use functions for serializing and deserializing data.

## Example
```ts
import { JSON } from './JSON';

// Serialization example
const obj: { name: string; age: number; dob: Date } = {
  name: 'John Doe',
  age: 30,
  gender: "Male"
};

const serializedData = JSON.stringify(obj);
console.log(serializedData); // Output: '{"name":"John Doe", "gender": "Male"}'

// Deserialization example
const deserializedData = JSON.parse(serializedData);
console.log(deserializedData); // Output: { name: "John Doe", gender: "Male" }
```

## Supported Data Types
### Primitive types 
- Number
- String
- Boolean
### Primitive types
- Array
- Object
<!-- - Date and Time
- Binary Data Support -->

<!-- Binary data support is not currently implemented, but it may be added in future versions of the library. -->


## License
This library is licensed under the [MIT](/LICENSE) License.