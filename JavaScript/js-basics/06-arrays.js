const carriage = ["Navdeep" , "Ananya" , "Navya"];
const emptycarriage =  [];

const threeEmptySeats = Array(3)
console.log(threeEmptySeats);

const passenger = Array("Navdeep", "Ananya" , "Navya");
const singlePassenger = Array.of(3);
console.log(singlePassenger);


const trainCode = Array.from("DUST");
console.log(trainCode);

const tempTrain = ["A" , "B" , "C" , "D" , "E"];
tempTrain.length = 3;
console.log(tempTrain);

tempTrain.length = 5;
console.log(tempTrain);
``

// const trainCopy = tempTrain.slice(3)
// console.log(trainCopy);


// Searching: indexOf, includes, find, findIndex
//

console.log(typeof []);
console.log(Array.isArray([]));
console.log(Array.isArray("Ravi")); // String is a array of characters - ye bolne me acha h use mt kr lena. Aisa ni hota

/*
Key Points :-

1. Always use Array in literals avoid array(n)- bcoz it creates empty spaces.

2. Array are zero based.

3. Mutating Methods - Push , Pop , Shift , unshift . splice

4. Non-Mutating - concat , slice , flat , flatmap[1 , 2 , 3 , [5 , 6]]

5. Seaching includes

6. Array.isArray is the only way to find whether the given thing is array or not.


*/