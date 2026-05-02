const artifact ={
    name : "Obsidian Crown",
    Era : "Ancient",
    value : 50000,
    materials : "Volcanic Glass",
};
const keys = Object.keys(artifact);
const values = Object.values(artifact);
const entries = Object.entries(artifact);

console.log(keys);
console.log(values);
console.log(entries);


// We can Print entries through Loop:-

for(const [key , value] of Object.entries(artifact)){
    console.log(`${key} : ${value}`);
}

const priceList = [
    ["Obsidian Crown" , 50000],
    ["Ruby Pendant" , 30000],
    ["Iron Shield" , 5000],
];

const priceObject = Object.fromEntries(priceList);
console.log(priceObject);

const displayCase = {
    artifact : "Obsidian",
    location : "Hall A , Case 3",
    locked : true,
}

Object.freeze(displayCase);
delete displayCase.locked
console.log(displayCase);


Object.seal(artifact);
delete artifact.Era;
artifact.value = 20000;

console.log(artifact);

const secureArtifacts = {name : "Ruby Pendant"}

Object.defineProperty(secureArtifacts , "catalogId", {
    value : "SEC - 999",
    writable : false,
    enumerable :false,
    configurable : false,
})

console.log(secureArtifacts.catalogId);
secureArtifacts.catalogId = "Hacked";
console.log(secureArtifacts.catalogId);

// If enumerable is True

for(const [key , value] of Object.entries(secureArtifacts)){
    console.log(`${key} : ${value}`);
}// catelogId print kr do

// if enumerable is false -- catelogId will doesn't give any error.  but it will not print catelogId.

