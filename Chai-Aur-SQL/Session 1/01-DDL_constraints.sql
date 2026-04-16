CREATE DATABASE studentdb;
USE studentdb;

CREATE TABLE students(
    student_id SERIAL PRIMARY KEY ,
    first_name VARCHAR(50),
    email VARCHAR(100),
    phone_number VARCHAR(10),
    country_code VARCHAR(4),
    age INT CHECK(age > 12),
    current_status VARCHAR(20) DEFAULT 'active' CHECK(current_status IN ('active' , 'graduated' , 'dropped-out')),
    masterji_handle VARCHAR(50) UNIQUE,
    has_joined_masterji BOOLEAN DEFAULT FALSE,
    current_score INT DEFAULT 0 CHECK(current_score >= 0 AND current_score <= 100),
    enrollment DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE students

ADD COLUMN batch_name VARCHAR(50) DEFAULT 'Web Dev 2026';

INSERT INTO students (first_name, email, phone_number, country_code, age, masterji_handle) VALUES
('Alice', 'alice@example.com', '1234567890', 'IN', 20, 'alice_masterji'),
('Bob', 'bob@example.com', '0987654321', 'US', 22, 'bob_masterji'),
('Charlie', 'charlie@example.com', '1111111111', 'CA', 21, 'charlie_masterji');

SELECT * FROM students;


CREATE DATABASE ipl;

USE ipl;

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
-- DQL => Data Query Language

SELECT name , nickname , team , role FROM ipl_players


-- FILETERING:- 

SELECT * FROM ipl_players WHERE team = 'Mumbai Indians';
SELECT name , nickname , auction_price_crores FROM ipl_players Where auction_price_crores > 15 AND team = 'Mumbai Indians';

--Logical Operators (AND , OR)

SELECT * FROM ipl_players WHERE wickets_taken >20 AND role = 'All-rounder';

SELECT * FROM ipl_players WHERE team = 'Rajasthan Royals' OR 'CSK';