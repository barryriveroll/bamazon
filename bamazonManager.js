var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  startManager();
});

function startManager() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Select menu option:",
        choices: [
          "View All Products",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ],
        name: "choice"
      }
    ])
    .then(function(response) {
      var allProducts = "SELECT * FROM products";
      var lowProducts = "SELECT * FROM products WHERE stock_quantity <= 5";

      switch (response.choice) {
        case "View All Products":
          displayProducts(allProducts, null, startManager);
          break;
        case "View Low Inventory":
          displayProducts(lowProducts, null, startManager);
          break;
        case "Add to Inventory":
          addToInventory();
          break;
        case "Add New Product":
          addNewProduct();
          break;
      }
    });
}

function addNewProduct() {
  inquirer
    .prompt([
      {
        message: "Enter product name:",
        name: "name"
      },
      {
        message: "Enter product department:",
        name: "department"
      },
      {
        message: "Enter product price:",
        name: "price",
        validate: function(name) {
          return !name.includes("e") && !isNaN(name);
        }
      },
      {
        message: "Enter an initial stock quantity:",
        name: "stock",
        validate: function(name) {
          return Number.isInteger(parseInt(name));
        }
      }
    ])
    .then(function(response) {
      var newProduct = {
        product_name: response.name,
        department_name: response.department,
        price: response.price,
        stock_quantity: response.stock
      };

      console.log("Adding product to the store:");
      console.log(
        "| " +
          newProduct.product_name +
          " | " +
          newProduct.department_name +
          " | " +
          newProduct.price +
          " | " +
          newProduct.stock_quantity
      );

      inquirer
        .prompt([
          {
            type: "confirm",
            message: "Confirm adding new product?",
            name: "confirm"
          }
        ])
        .then(function(confirmResponse) {
          if (confirmResponse.confirm) {
            var query = connection.query(
              "INSERT INTO products SET ?",
              {
                product_name: newProduct.product_name,
                department_name: newProduct.department_name,
                price: newProduct.price,
                stock_quantity: newProduct.stock_quantity
              },
              function(err, res) {
                startManager();
              }
            );
          }
        });
    });
}

function addToInventory() {
  var query = "SELECT item_id, product_name FROM products";
  connection.query(query, function(err, results) {
    if (err) throw err;

    var idArray = [];
    for (var i = 0; i < results.length; i++) {
      idArray.push(results[i].item_id + ": " + results[i].product_name);
    }

    inquirer
      .prompt([
        {
          type: "list",
          message: "Enter the item ID of the item you want to add to:",
          name: "item",
          choices: idArray
          //   validate: function(name) {
          //     return idArray.includes(parseInt(name));
          //   }
        }
      ])
      .then(function(response) {
        var idToAdd = response.item.split(":");
        var query2 = "SELECT * FROM products WHERE item_id = ?";
        displayProducts(query2, idToAdd, purchaseItem);
      });
  });
}

function purchaseItem(results) {
  inquirer
    .prompt([
      {
        message: "How many do you want to purchase?",
        name: "amount",
        validate: function(name) {
          return Number.isInteger(parseInt(name));
        }
      }
    ])
    .then(function(response) {
      var totalCost = parseInt(response.amount) * results[0].price;
      console.log(
        "\x1b[33m",
        "Purchasing: ",
        "\x1b[0m",
        response.amount +
          " " +
          results[0].product_name +
          " $" +
          results[0].price.toFixed(2) +
          "\x1b[33m",
        "\n Total Cost: ",
        "\x1b[0m",
        "$" + totalCost.toFixed(2)
      );

      inquirer
        .prompt([
          {
            type: "confirm",
            message: "Confirm order?",
            name: "confirm"
          }
        ])
        .then(function(responseTwo) {
          if (responseTwo.confirm) {
            var newStock =
              results[0].stock_quantity + parseInt(response.amount);
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: newStock
                },
                {
                  item_id: results[0].item_id
                }
              ],
              function(err, res) {
                if (err) throw err;
                startManager();
              }
            );
          }
        });
    });
}

function displayProducts(query, options, callback) {
  connection.query(query, options, function(err, results) {
    if (err) throw err;

    var idArray = [];
    var nameArray = [];
    var deptArray = [];
    var priceArray = [];
    var stockArray = [];

    results.forEach(function(element) {
      idArray.push(element.item_id);
      nameArray.push(element.product_name);
      deptArray.push(element.department_name);
      priceArray.push(element.price.toString());
      stockArray.push(element.stock_quantity);
    });

    var nameLength = findLongestValue(nameArray, " Product Name ");
    var deptLength = findLongestValue(deptArray, " Department ");
    var priceLength = findLongestValue(priceArray, " Price ");
    var stockLength = findLongestValue(stockArray, " Quantity ");

    var topText =
      " |  ID  | " +
      nameLength +
      "   | " +
      deptLength +
      "   | " +
      priceLength +
      "   | " +
      stockLength +
      "   |";
    var divisionLine = " ";
    for (var i = 0; i < topText.length - 1; i++) {
      if (
        i === 0 ||
        i === 7 ||
        i === nameLength.length + 12 ||
        i === nameLength.length + deptLength.length + 17 ||
        i === nameLength.length + deptLength.length + priceLength.length + 22 ||
        i ===
          nameLength.length +
            deptLength.length +
            priceLength.length +
            stockLength.length +
            27
      ) {
        divisionLine += "|";
      } else {
        divisionLine += "-";
      }
    }

    console.log("\x1b[33m%s\x1b[0m", divisionLine);
    console.log("\x1b[33m%s\x1b[0m", topText);
    console.log("\x1b[33m%s\x1b[0m", divisionLine);

    for (var j = 0; j < results.length; j++) {
      // results.forEach(function(element) {
      var idToPrint = "";
      var nameToPrint = textToPrint(results[j].product_name, nameLength);
      var deptToPrint = textToPrint(results[j].department_name, deptLength);
      var priceToPrint = textToPrint(
        results[j].price.toFixed(2).toString(),
        priceLength
      );
      var stockToPrint = textToPrint(
        results[j].stock_quantity.toString(),
        stockLength
      );

      // ID LENGTH
      if (results[j].item_id >= 10) {
        idToPrint = results[j].item_id;
      } else {
        idToPrint = " " + results[j].item_id;
      }

      console.log(
        "\x1b[33m",
        "|",
        "\x1b[0m",
        idToPrint,
        "\x1b[33m",
        "|",
        "\x1b[0m",
        nameToPrint,
        "\x1b[33m",
        "|",
        "\x1b[0m",
        deptToPrint,
        "\x1b[33m",
        "|",
        "\x1b[0m",
        priceToPrint,
        "\x1b[33m",
        "|",
        "\x1b[0m",
        stockToPrint,
        "\x1b[33m",
        "|"
      );
    }
    console.log("\x1b[33m%s\x1b[0m", divisionLine);
    if (callback) {
      callback(results);
    }
    // connection.end();
  });
}

function findLongestValue(array, string) {
  var lengthCount = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i].length > lengthCount) {
      lengthCount = array[i].length;
    }
  }

  var maxLength = string;
  for (var i = maxLength.length; i < lengthCount + 3; i++) {
    maxLength += " ";
  }
  return maxLength;
}

function textToPrint(toPrint, varLength) {
  if (toPrint.length < varLength.length) {
    var spaces = varLength.length - toPrint.length;
    for (var j = 0; j < spaces; j++) {
      toPrint += " ";
    }
    return toPrint;
  }
}
