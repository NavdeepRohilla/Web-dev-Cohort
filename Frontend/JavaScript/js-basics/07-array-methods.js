const orders = [
    {dish : "Daal Makhni" , price : 12 , spicy : true , qty : 2} ,
    {dish : "Burger" , price : 4 , spicy : false , qty : 1} ,
    {dish : "Kadhai Paneer" , price : 18 , spicy : true , qty : 3} ,
    {dish : "Biryani" , price : 22 , spicy : false , qty : 5} ,
    {dish : "Butter Chicken" , price : 19 , spicy : true , qty : 2} ,
]
const myData = orders.forEach((orders , index)  => {
    console.log(`${index + 1} : ${orders.qty} * ${orders.dish}`);
});
