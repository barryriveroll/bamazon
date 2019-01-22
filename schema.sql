DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(10) NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Banana", "Produce", 0.30, 260);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Golden Banana", "Produce", 199.99, 2);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("George of the Jungle", "Movies", 10.99, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Super Smash Bros.: Ultimate", "Games", 58.99, 100);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("50 Shades of Grey", "Books", 20.01, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Dog Bed", "Pets", 15.49, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Gourd", "Produce", 3.00, 3000);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Destiny: The Movie", "Movies", 100.99, 40);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Bark-to-English Translator", "Pets", 5000, 2);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Personal Space Shuttle", "Electronics", 80000, 1);

SELECT * FROM products;