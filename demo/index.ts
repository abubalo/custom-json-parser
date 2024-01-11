import { _JSON } from "../src/JSON";




const person = {
    name: "Josh",
    age: 24,
    hasEaten: false,
    child: {
      name: "Jamiu",
      age: 14,
      hasEaten: true
    }, 
    belongings: ["books", "money", "pen"]
  };

const jsonString = _JSON.stringify(person);

const jsonObject = _JSON.parse(jsonString);

console.log(jsonObject, jsonString);
// console.log(`JSONString: ${jsonString} JSONObject ${jsonObject}`);


