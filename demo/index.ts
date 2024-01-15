import { _JSON } from "../src/JSON";

const person = {
  name: "John Doe",
  age: 30,
  isStudent: false,
  city: "New York",
  skills: ["JavaScript", "HTML", "CSS"],
  address: {
    street: "123 Main St",
    zipCode: "10001",
    country: "USA",
  },
  grades: {
    math: 95,
    science: 88,
    history: 75,
  },
  friends: [
    {
      name: "Alice",
      age: 28,
      isStudent: true,
    },
    {
      name: "Bob",
      age: 32,
      isStudent: false,
    },
  ],
};

const jsonString = _JSON.stringify(person);

const jsonObject = _JSON.parse(jsonString);

console.log("Serialized: ", jsonString);
console.log("Deserialize: ", jsonObject);
