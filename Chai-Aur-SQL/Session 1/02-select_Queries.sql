CREATE DATABASE ipl;

USE ipl;
CREATE TABLE ipl_players(
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team VARCHAR(50),
    role VARCHAR(50) CHECK(role IN ('Batsman' , 'Bowler' , 'All-rounder' , 'Wicket-Keeper')),
    runs_scored INT CHECK(runs_scored >= 0),
    wickets_taken INT CHECK(wickets_taken >= 0),
    auction_price_crores INT
);

ALTER TABLE ipl_players

ADD COLUMN nickname VARCHAR(50);

INSERT INTO ipl_players(name , team , role , runs_scored , wickets_taken , auction_price_crores , nickname) VALUES
("Rohit Sharma" , "Mumbai Indians" , "Batsman" , 520 , 54 , 16 , "HIT-MAN"),
("Virat Kohli" , "Royal Challengers Bengluru" , "Batsman" , 589 , 12 , 17 , "King kohli" ),
("MS Dhoni" , "CSK" , "Wicket-Keeper" , 230 , 5 , 5 , "THALA" ),
("Hardik Pandya" , "Mumbai Indians" , "All-rounder" , 410 , 152 , 18 , "Ustad jii" ),
("Krunal Pandya" , "Royal Challengers Bengluru" , "All-rounder" , 501 , 98 , 14 , "Bade Ustad ji" ),
("Arshdeep Singh" , "Punjab Kings" , "Bowler" , 75 , 200 , 18 , "Arshu" ),
("Shryesh Iyer" , "Punjab Kings" , "Batsman" , 750 , 25 , 27 , "Sarpanch Sahab" ),
("Jasprit Bumrah" , "Mumbai Indians" , "Bowler" , 45 , 210 , 20 , "BOOM - BOOM"),
("Gautam Gambhir" , "Kolkata Knight Riders" , "Batsman" , 650 , 50 , 12 , "Gauti"),
("Sanju Samson" , "Rajasthan Royals" , "Wicket-Keeper" , 405 , 20 , 22 , "Justice"),
("Avesh Khan" , "Delhi capitals" , "Bowler" , 201 , 59 , 10 , "Avesh ji" );


SELECT * FROM ipl_players;

-- DDL => Data Definition Language : It is a language which we use to define a structure in a SQL database.
-- DML => Data Manipulation Language


SELECT name , nickname , team , role FROM ipl_players


-- FILETERING:- 

SELECT * FROM ipl_players WHERE team = 'Mumbai Indians';
SELECT name , nickname , auction_price_crores FROM ipl_players Where auction_price_crores > 15 AND team = 'Mumbai Indians';

--Logical Operators (AND , OR)

SELECT * FROM ipl_players WHERE wickets_taken >20 AND role = 'All-rounder';

SELECT * FROM ipl_players WHERE team = 'Rajasthan Royals' OR team = 'CSK';

-- Pattern Matching :-

SELECT * FROM ipl_players WHERE name LIKE '_a%';
SELECT * FROM ipl_players WHERE team IN ('Mumbai Indians' , 'Kolkata Knight Riders' , 'Rajasthan Royals');

-- SORTING

SELECT name , nickname , auction_price_crores
FROM ipl_players
ORDER BY auction_price_crores DESc;


-- Team in alphabetical order and price in DESC

SELECT name , nickname , auction_price_crores , team
FROM ipl_players
ORDER BY team ASC , auction_price_crores DESC;


-- Pagination 
SELECT name , nickname , auction_price_crores
FROM ipl_players
ORDER BY auction_price_crores DESC
LIMIT 3;


SELECT name , nickname , auction_price_crores
FROM ipl_players
ORDER BY auction_price_crores DESC
LIMIT 100 OFFSET 3;


-- Modifying data in future

SELECT name , nickname , auction_price_crores , (auction_price_crores * 100)
AS price_in_table
FROM ipl_players;


SELECT name , nickname , (auction_price_crores + 2 ) AS new_price
FROM ipl_players;


-- How to get Distinct values:-

SELECT DISTINCT role FROM ipl_players;



-- DQL => Data Query Language

