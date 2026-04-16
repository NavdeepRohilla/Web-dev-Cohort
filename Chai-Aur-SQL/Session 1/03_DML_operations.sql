-- item name category price isavailable
CREATE DATABASE masterji_canteen;
USE masterji_canteen;
CREATE TABLE canteen_menu(
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100),
    category VARCHAR(50),
    price INT,
    is_available BOOLEAN DEFAULT TRUE
);

INSERT INTO canteen_menu(item_name , category , price , is_available) VALUES
("Veg Sandwich" , "Snacks" , 50 , TRUE),
("Chicken Sandwich" , "Snacks" , 80 , TRUE),
("Paneer Sandwich" , "Snacks" , 70 , FALSE),
("Veg Burger" , "Snacks" , 60 , TRUE),
("Chicken Burger" , "Snacks" , 90 , TRUE),
("Veg Pizza" , "Main Course" , 150 , TRUE),
("Chicken Pizza" , "Main Course" , 200 , TRUE),
("Paneer Pizza" , "Main Course" , 180 , FALSE),
("Veg Pasta" , "Main Course" , 120 , TRUE),
("Chicken Pasta" , "Main Course" , 170 , TRUE);

SELECT * FROM canteen_menu;

UPDATE canteen_menu
SET price = price + 20
WHERE category = 'Snacks' OR item_name LIKE '%Pizza';

UPDATE canteen_menu
SET is_available = FALSE
WHERE item_name IN ('Paneer Sandwich' , 'Paneer Pizza');

SELECT * FROM canteen_menu; 

UPDATE masterji_canteen.canteen_menu
SET price = price - 10
WHERE category = 'Main Course' AND is_available = TRUE;


DELETE FROM canteen_menu
WHERE item_name = 'Veg Burger';