const clue1 = "Muddy footprint near the Window"
const clue2 = "Broken Glass on the table"
console.log(clue1)
console.log(clue2)

const suspectName = "Navdeep"
const suspectAge = 20

console.log(`The suspect's name is ${suspectName} and age is ${suspectAge}`);

console.warn("Warning: Fingerprint evidence detected");
console.error("Error: Fingerprint evidence destroyed");

const evidenceLog = [
    {id: 1 , item: "Muddy footprint" , location: "Window"},
    {id: 2 , item: "Broken Glass", location: "Living Room",},
    {id:3 , item : "Red fiber stand", location: "Door Handle"}
]
console.table(evidenceLog);

console.group("Stack");
console.log("My list 1");
console.log("My list 2");
console.log("My list 3");
console.groupEnd();

console.time("DNA Matching")
let dnaMatches = 0
for(let i = 0; i < 1_000_000; i++){
    dnaMatches++;
}
console.timeEnd("DNA Matching");

console.log("Chaicode");
console.log("Chaicode");
console.log("Chaicode");
console.log("Chaicode");
