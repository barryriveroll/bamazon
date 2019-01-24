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
  startShop();
});

function startShop() {
  var query = "SELECT * FROM products";
  connection.query(query, function(err, results) {
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
    inquirer
      .prompt([
        {
          name: "item",
          message: "What item do you want to purchase?",
          validate: function(name) {
            return idArray.includes(parseInt(name));
          }
        }
      ])
      .then(function(response) {
        var itemId = response.item - 1;
        var itemToBuy = {
          item_id: results[itemId].item_id,
          product_name: results[itemId].product_name,
          department_name: results[itemId].department_name,
          price: results[itemId].price,
          stock_quantity: results[itemId].stock_quantity
        };

        updateInventory(itemToBuy, divisionLine);
      });
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

function updateInventory(itemToBuy) {
  console.log(
    itemToBuy.item_id +
      ": " +
      itemToBuy.product_name +
      " | " +
      itemToBuy.department_name +
      " | " +
      itemToBuy.price.toFixed(2) +
      " | " +
      itemToBuy.stock_quantity
  );

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
      if (itemToBuy.stock_quantity < response.amount) {
        console.log("Insufficient quantity!");
        updateInventory(itemToBuy);
      } else {
        var totalCost = itemToBuy.price * response.amount;
        console.log(
          "Ordering:\n" +
            itemToBuy.product_name +
            "\nQty: " +
            response.amount +
            "\nPrice: $" +
            itemToBuy.price +
            "\nTotal: $" +
            totalCost
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
              var newStock = itemToBuy.stock_quantity - response.amount;
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: newStock
                  },
                  {
                    item_id: itemToBuy.item_id
                  }
                ],
                function(err, res) {
                  if (err) throw err;
                  connection.end();
                  // startShop();
                }
              );
            } else {
              // NO CONFIRMATION
            }
          });
      }
    });
}
