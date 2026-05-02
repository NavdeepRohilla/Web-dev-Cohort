const hero = {
    name : "Harvey Spector",
    class : "Lawyer",
    level : 12,
    health : 88,
    isAlive : true,
    rank : "The Best Lawyer",
};

hero.isAlive = false;
hero.level = 18;
delete hero.health;

console.log(typeof hero.isAlive);

const ranger = {
    name : "Lakshya the shift",
    agility : 80,
    stealth : undefined,
}

console.log("name" in ranger);
console.log("stealth" in ranger);
console.log("toString" in ranger);

console.log(ranger.hasOwnProperty("to String"));
