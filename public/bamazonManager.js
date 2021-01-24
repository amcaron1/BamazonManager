// Declares global variables
var currentTable = "#products";
var currentModal = "none";
var idArray = [];

$(document).ready(function () {

    // Hides sales
    $("#sales").hide();

    // Fills the product-table
    displayProducts();

})

// Fills the product-table
function displayProducts() {

    // Gets the products from the database
    $.get("/products", function (res) {

        // Empties the product-table, sets the table header, and clears the idArray
        $("#product-table").empty();
        $("#sub-header").text("All Products");
        idArray.splice(0, idArray.length);         

        // Creates and displays a table row for each product
        // Note that 'floatRight' right justifies, and 'floatFix' turns off the float so that the value does not float up
        for (var i = 0; i < res.length; i++) {
            idArray.push(res[i].item_id);
            $("#product-table").append("<tr><td class='itemID'>" + res[i].item_id + "</td><td class='productName'>" + res[i].product_name + "</td><td class='deptName'>" + res[i].department_name + "</td ><td class='floatFix'><div class='price floatRight'>" + formatCurrency(res[i].price) + "</div></td><td class='stockQuantity'>" + res[i].stock_quantity + "</td><td class='floatFix'><div class='productSales floatRight'>" + formatCurrency(res[i].product_sales) + "</div></td></tr>");
        }

        // If another table is currently displayed, hides that table and shows the product-table
        if (currentTable != "#products") {
            $(currentTable).hide();
            currentTable = "#products";
            $("#products").show(); 
        }
    })
}

// Formats currency by inserting commas and '$ '
function formatCurrency(n) {
    if (n < 0) {
        return "-" + formatPositiveCurrency(Math.abs(n));
    } else {
        return formatPositiveCurrency(n);
    }
}

function formatPositiveCurrency(n) {
    return "$" + n.toFixed(2).replace(/./g, function (currentChar, currentIndex, inputString) {
        return currentIndex > 0 && currentChar !== "." && (inputString.length - currentIndex) % 3 === 0 ? "," + currentChar : currentChar;
    });
}

// Calls displayProducts to display all products
$(document).on("click", "#all-products", function () { 
    displayProducts(); 
})

// Displays products that have quantity less then or equal to 10
$(document).on("click", "#low-inventory", function () {

    // Gets the products from the database
    $.get("/low_inventory", function (res) {

        // Empties the product-table and sets the table header
        $("#product-table").empty();
        $("#sub-header").text("Low Inventory");

        // Creates and displays a table row for each product that has quantity less than or equal to 10
        // Note that 'floatRight' right justifies, and 'floatFix' turns off the float so that the value does not float up.
        for (var i = 0; i < res.length; i++) {
            $("#product-table").append("<tr><td class='itemID'>" + res[i].item_id + "</td><td class='productName'>" + res[i].product_name + "</td><td class='deptName'>" + res[i].department_name + "</td ><td class='floatFix'><div class='price floatRight'>" + formatCurrency(res[i].price) + "</div></td><td class='stockQuantity'>" + res[i].stock_quantity + "</td><td class='productSales'>" + res[i].product_sales + "</td></tr>");
        }

        // If another table is currently displayed, hides that table and shows the product-table
        if (currentTable != "#products") {
            $(currentTable).hide();
            currentTable = "#products";
            $("#products").show();    
        }
    })
})

// Displays the quantity-modal
$(document).on("click", "#change-quantity", function () {
    currentModal = "#quantity-modal";
    $('#quantity-modal').modal({ backdrop: 'static', keyboard: false });
    $('#quantity-modal').modal("show");
})

// Updates the database with a new quantity
$(document).on("click", "#submit-change-quantity", function () {

    // Gets the itemID and newQuantity from the DOM
    var itemID = $("#quantity-id").val();
    var newQuantity = $("#new-quantity").val();

    // If the itemID is not valid, an error message is displayed
    if (idArray.indexOf(parseInt(itemID)) == -1) {
        $("#quantity-modal").modal("hide");
        $("#error-title").text("Change Quantity");
        $("#error-message").text("Must enter a valid Item ID");
        $('#error-modal').modal({ backdrop: 'static', keyboard: false });
        $("#error-modal").modal("show");
    } else {

        // Updates the database with newQuantity
        $.ajax({
            'type': 'put',
            'url': '/change_inventory',
            'data': { "itemID": itemID, "newQuantity": newQuantity },
            'success': function (res) {

                // If the order was successful, the quantity-form is reset, the quantity-modal is hidden, and displayProducts is called
                $("#quantity-form").trigger("reset");
                currentModal = "none";
                $("#quantity-modal").modal("hide");
                displayProducts();
            }
        })
    }
})

// Displays the add-product-modal
$(document).on("click", "#add-product", function () {

    // Get department names
    $.get("/department_names", function (res) {

        // Empties the department-name options
        $("#department-name").empty();

        // Gets the department_names from the departments table
        for (var i = 0; i < res.length; i++) {
            $("#department-name").append("<option>" + res[i].department_name + "</option>");
        }
    })

    currentModal = "#add-product-modal";
    $('#add-product-modal').modal({ backdrop: 'static', keyboard: false });
    $("#add-product-modal").modal("show");
})

// Adds a new product to the database
$(document).on("click", "#submit-add-product", function () {

    // If the new-product-name is not valid, an error message is displayed
    if ($("#new-product-name").val().trim() == "") {
        $("#add-product-modal").modal("hide");
        $("#error-title").text("Add Product");
        $("#error-message").text("Must enter a Product Name");
        $('#error-modal').modal({ backdrop: 'static', keyboard: false });
        $("#error-modal").modal("show");
    } else {

        // Adds a new product to the database
        $.ajax({
            'type': 'post',
            'url': '/add_product',
            'data': { "newProductName": $("#new-product-name").val(), "departmentName": $("#department-name option:selected").text(), "price": $("#price").val(), "stockQuantity": $("#stock-quantity").val() },
            'success': function (res) {

                // If the add was successful, the add-product-form is reset, the add-product-modal is hidden, and displayProducts is called
                $("#add-product-form").trigger("reset");
                currentModal = "none";
                $("#add-product-modal").modal("hide");
                displayProducts();
            }
        })
    }
})

// Displays the delete-modal
$(document).on("click", "#delete-product", function () {
    currentModal = "#delete-modal";
    $('#delete-modal').modal({ backdrop: 'static', keyboard: false });
    $("#delete-modal").modal("show");
})

// Deletes a product from the database
$(document).on("click", "#submit-delete-product", function () {

    // Gets the itemID from the DOM
    var itemID = $("#delete-id").val();

    // If the itemID id not valid, an error message is displayed
    if (idArray.indexOf(parseInt(itemID)) == -1) {
        $("#delete-modal").modal("hide");
        $("#error-title").text("Change Quantity");
        $("#error-message").text("Must enter a valid Item ID");
        $('#error-modal').modal({ backdrop: 'static', keyboard: false });
        $("#error-modal").modal("show");
        
    } else {

        // Deletes a product from the database
        $.ajax({
            'type': 'delete',
            'url': '/delete_product',
            'data': { "itemID": itemID },
            'success': function (res) {

                // If the order was successful, the delete-form is reset, the delete-modal is hidden, and displayProducts is called
                $("#delete-form").trigger("reset");
                currentModal = "none";
                $("#delete-modal").modal("hide");
                displayProducts();
            }
        })
    }
})

// Displays the add-department-modal
$(document).on("click", "#add-department", function () {
    currentModal = "#add-department-modal";
    $('#add-department-modal').modal({ backdrop: 'static', keyboard: false });
    $("#add-department-modal").modal("show");
})

// Adds a new product to the database
$(document).on("click", "#submit-add-department", function () {

    // If the new-department-name is not valid, an error message is displayed
    if ($("#new-department-name").val().trim() == "") {
        $("#add-department-modal").modal("hide");
        $("#error-title").text("Add Department");
        $("#error-message").text("Must enter a Department Name");
        $('#error-modal').modal({ backdrop: 'static', keyboard: false });
        $("#error-modal").modal("show");
    } else {

        // Adds a new product to the database
        $.ajax({
            'type': 'post',
            'url': '/add_department',
            'data': { "newDepartmentName": $("#new-department-name").val(), "overheadCosts": $("#overhead-costs").val() },
            'success': function (res) {

                // If the add was successful, the add-department-form is reset, the add-department-modal is hidden, and displayProducts is called
                $("#add-department-form").trigger("reset");
                currentModal = "none";
                $("#add-department-modal").modal("hide");
                displaySales();         
            }
        })
    }
})

// Calls displaySales to display product sales
$(document).on("click", "#product-sales", function () {
    displaySales();
})

// Displays product sales
function displaySales() {

    // Gets sales info from database
    $.get("/product_sales", function (res) {

        // Empties sales-talbe
        $("#sales-table").empty();

        console.log("res[0].total_profit = " + res[0].total_profit);

        // Creates and displays a table row for each department
        // Note that 'floatRight' right justifies, and 'floatFix' turns off the float so that the value does not float up
        for (var i = 0; i < res.length; i++) {

            // If  department does not have any products, product_sales is set to "0.00" and total_profit is set to "- overhead_costs"
            if (res[i].department_sales == null) {
                res[i].department_sales = 0.00;
                res[i].total_profit = - res[i].overhead_costs;
            }
            $("#sales-table").append("<tr><td class='departmentID'>" + res[i].department_id + "</td><td class='departmentName'>" + res[i].department_name + "</td ><td class='floatFix'><div class='overheadCosts floatRight'>" + formatCurrency(res[i].overhead_costs) + "</td ><td class='floatFix'><div class='productSales floatRight'>" + formatCurrency(res[i].department_sales) + "</td ><td class='floatFix'><div class='totalProfit floatRight'>" + formatCurrency(res[i].total_profit) + "</td></tr>");
        }

        // If another table is currently displayed, hides that table and shows the sales-table
        if (currentTable != "#sales") {
            $(currentTable).hide();
            currentTable = "#sales";
            $("#sales").show();   
        }
    })
}

// Shows the current input modal after the error modal is closed
$(document).on("click", ".close-error", function () {
    if (currentModal != "none") {
        $(currentModal).modal("show");
    }
})

// Resets currentModal and currentform after an input modal is closed
$(document).on("click", ".close-input", function () {
    var currentForm = currentModal.replace("modal", "form");
    currentModal = "none";
    $(currentForm).trigger("reset");
    
})