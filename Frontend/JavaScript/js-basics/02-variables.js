// const is used to make constants which can't be changed later .
const shipName = "The Amber"
console.log(shipName);

// let is used to make the variables which we can changed further. 
let crewCount = 12
console.log(crewCount);

crewCount = 13 // We can change it it doesn't show any error.

// var is an oler method to create variable . currently we are not using this in modern JavaScript because it has a scope problem. 

var captainName = "Jack Sparrow"
console.log(captainName);

captainName =  "Hitesh Sir"

if (true) {
    var leakyTreasure = "Gold Coins";
}
console.log(leakyTreasure); // block scope nhi h thats why it will print


// isse bhi khatarnaak
for(var i = 0 ; i < 10 ; i++) {
    //
}

for (let i = 0 ; i < 10 ; i++) {
    //
}

let shipSpeed = 22
let _privatelog = "secret"
let MONGODB_URI = ""
let name = "Navdeep"

const treasureChest = {
    gold : 100,
    rubbies : 50,
    map : 2
}

const crewRoaster = ["Alok" , "Abhishek" , "Tanish"]
crewRoaster.push("Navdeep")

crewRoaster[0] = "Shubham"
console.log(crewRoaster);

crewRoaster = ["someone"]

console.log(crewRoaster);
