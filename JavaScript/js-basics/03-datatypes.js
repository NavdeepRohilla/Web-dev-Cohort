const weaponName = "Sword"
console.log(`The ${weaponName} is a sharp weapon | typeof sword is ${typeof weaponName}`);


const attackPower = 75 // & 75n when n is in last of integer it will be big Int;
console.log(`The attack power of ${weaponName} is ${attackPower} | typeof attackPower is ${typeof attackPower}`);

const isLoggedIn = true // & true or false is boolean;
console.log(`Is user logged in? ${isLoggedIn} | typeof isLoggedIn is ${typeof isLoggedIn}`);

const userName = "John Doe" // & John Doe is string;
console.log(`The user name is ${userName} | typeof userName is ${typeof userName}`);

const userAge = 25 // & 25 is number;
console.log(`The user age is ${userAge} | typeof userAge is ${typeof userAge}`);

const userEmail = "john.doe@example.com" // & john.doe@example.com is string;
console.log(`The user email is ${userEmail} | typeof userEmail is ${typeof userEmail}`);

let bonusEffect; // & undefined is undefined;

let nullValue = null; // & null is null;
console.log(`The null value is ${nullValue} | typeof nullValue is ${typeof nullValue}`);

let symbolValue = Symbol("unique"); // & symbol is symbol;
console.log(`The symbol value is ${symbolValue} | typeof symbolValue is ${typeof symbolValue}`);

let bigIntValue = 123456789012345678901234567890n; // & bigInt is bigInt;
console.log(`The bigInt value is ${bigIntValue} | typeof bigIntValue is ${typeof bigIntValue}`);

let objectValue = {name: "John Doe", age: 25, email: "john.doe@example.com"}; // & object is object;
console.log(`The object value is ${objectValue} | typeof objectValue is ${typeof objectValue}`);

let arrayValue = [1, 2, 3, 4, 5]; // & array is array;

const heroStats = {
    name : "Navdeep",
    level : 10,
    class : "Warrior"
}
console.log(`The hero stats are ${heroStats} | typeof heroStats is ${typeof heroStats}`);


const inventory = ["Flame Sword" , "Health Potion" , "Shield"]
console.log(`The inventory are ${inventory} | type of inventopry is ${typeof inventory}`);

function castSpell() {
    return "Fireball";
}
console.log(`the spell type is ${castSpell() } | type of spell is ${typeof castSpell()}`);


let originalHP = 100;
let cloneHP = originalHP;
cloneHP = 80;

console.log(originalHP);
console.log(cloneHP);

const originalSword = {
    name : "Flame Sword",
    damage : 75 , 
    typeofW : "Fire"
};

console.log("Original Sword : " , originalSword.damage);``

const cloneSword = originalSword;
cloneSword.damage = 100;

console.log(originalSword);
console.log(cloneSword);

console.log("Original Sword : " , originalSword.damage);
console.log("Clone Sword : " , cloneSword.damage);


const armorOrigial = {
    name : "Iron Plate" , 
    defence : 80, 
    buff : {
        fire : 10,
    }
};

console.log(armorOrigial);
console.log("buff : " , armorOrigial.buff.fire);

const armorCopy = {...armorOrigial};
armorCopy.buff.fire = 90;

console.log(armorCopy);
console.log("buff : " , armorCopy.buff.fire);
console.log(armorOrigial);

typeof null === "object"

const potionOriginal = {name : "Health" , effects : {heal : 40 , mana : 30}}
const potionCopy = structuredClone(potionOriginal)
// in this method after copy the original function or we can say object will be same. it will not change after we put some change in the copied object.
console.log(potionOriginal);
potionCopy.effects.heal = 80;
console.log(potionCopy);

// // Check types of these things:-

console.log(typeof "ChaiCode");
console.log(typeof 45);
console.log(typeof 85n);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof Symbol());
console.log(typeof {});
console.log(typeof []);
console.log(typeof function name(params) {});

