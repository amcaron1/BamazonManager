// Allows the use of util.inspect for debugging
var util = require("util");
//  Loads environment variables from a .env file into process.env
require('dotenv').config()
// express handles web requests (GET, POST, etc)
var express = require("express");
// During execution, morgan logs requests to bash
var logger = require("morgan");
// mysql stores the database
var mysql = require("mysql");

// Initializes PORT
var PORT = process.env.PORT || 3000;

// Initializes express
var app = express();

// Sets morgan to development mode
app.use(logger("dev"));
// Parses POST or PUT requests as strings or arrays
app.use(express.urlencoded({ extended: true }));
// Parses POST or PUT requests as JSON
app.use(express.json());
// Identifies "public" as a folder for express to use to find static files for the application
app.use(express.static("public"));

// Sets up the database connection parameters
if (process.env.JAWSDB_URL) {
    connection = mysql.createConnection(process.env.JAWSDB_URL);
}
else {
    var connection = mysql.createConnection({
        host: process.env.dbHost,
        port: process.env.dbPort,
        user: process.env.dbUser,
        password: process.env.dbPassword,
        database: process.env.dbDatabase
    });
}

// Sets up the sever
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

// Creates the connection to the database
connection.connect(function (err) {
    if (err) { throw err; }
    console.log("connected as id " + connection.threadId);
});

// Selects all of the products from the products table 
app.get("/products", function (req, res) {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity, product_sales FROM products",
    function (err, sql_res) {
        if (err) { throw err; }

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Selects low inventory products from the products table 
app.get("/low_inventory", function (req, res) {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity, product_sales FROM products WHERE stock_quantity <= 10",
    function (err, sql_res) {
        if (err) { throw err; }

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Updates the quantity of a product
app.put("/change_inventory", function (req, res) {
    connection.query("UPDATE products SET stock_quantity = " + req.body.newQuantity + " WHERE item_id = " + req.body.itemID,
    function (err, sql_res) {
        if (err) throw err;

        // Converts the SQL response to JSON
        res.json(sql_res);
     })
})

// Adds a new product to the products table
app.post("/add_product", function (req, res) {
    //console.log("req = " + util.inspect(req, { depth: null }));
    connection.query("INSERT INTO products SET ?",
    {
        product_name: req.body.newProductName,
        department_name: req.body.departmentName,
        price: req.body.price,
        stock_quantity: req.body.stockQuantity
    },

    function (err, sql_res) {
        if (err) throw err;

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Deletes a product from the products table
app.delete("/delete_product", function (req, res) {
    //console.log("req = " + util.inspect(req, { depth: null }));
    connection.query("DELETE FROM products WHERE item_id = " + req.body.itemID,
    function (err, sql_res) {
        if (err) throw err;

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Adds a new department to departments table
app.post("/add_department", function (req, res) {
    //console.log("req = " + util.inspect(req, { depth: null }));
    connection.query("INSERT INTO departments SET ?",
    {
        department_name: req.body.newDepartmentName,
        overhead_costs: req.body.overheadCosts
    },

    function (err, sql_res) {
        if (err) throw err;

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Selects department table data, calculates product_sales by department from products table, and calculates total_profit by department
app.get("/product_sales", function (req, res) {
    connection.query("SELECT departments.department_id, departments.department_name, departments.overhead_costs, SUM(products.product_sales) AS department_sales, (SUM(products.product_sales)-departments.overhead_costs) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY department_name ORDER BY departments.department_id ASC",
    function (err, sql_res) {
        if (err) { throw err; }

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Selects all of the products from the products table 
app.get("/department_names", function (req, res) {
    connection.query("SELECT department_name FROM departments",
        function (err, sql_res) {
            if (err) { throw err; }

            // Converts the SQL response to JSON
            res.json(sql_res);
        })
})