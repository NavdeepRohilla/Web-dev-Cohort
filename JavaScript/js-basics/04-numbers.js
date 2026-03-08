/*const crewMembers = 40
const fuelTons = 142.2
const lightSpeed = 29_888_999
const infiniteRange = Infinity
const negativeInfiniteRange = -Infinity
const notANumber = NaN

console.log(crewMembers);
console.log(fuelTons);
console.log(lightSpeed);
console.log(infiniteRange);
console.log(negativeInfiniteRange);
console.log(notANumber);

                                                            Conversion                                                  
const fuelReadings = "142.72 tons";
const sectorCode = "0XA3"; 
const countdown = "007"

console.log(parseInt(countdown));
console.log(parseInt("111" , 2));

*/

const thrustForce = 4.464;

console.log(Math.round(thrustForce));
console.log(Math.floor(thrustForce));
console.log(Math.ceil(thrustForce));
console.log(Math.trunc(thrustForce));


function almostEqual(a,b) {
    return Math.abs(a-b) < Number.EPSILON
}
console.log(almostEqual(0.1 + 0.1 , 0.3));
// why it is false