const inputBoxLabelOrderDate = document.getElementById("input-box-label-order-date");
const inputBoxLabelOrderName = document.getElementById("input-box-label-order-name");
const tradeCheckbox = document.getElementById("trade-checkbox");
const tradeOptions = document.getElementById("trade-options");
const retailOptions = document.getElementById("retail-options");
const tradeCustomersSelect = document.getElementById("trade-customers-select");
const tradeCustomersSelectOptions = document.getElementsByClassName("trade-customer-select-option");
const defaultOption = document.getElementById("default-option");
const tradeCustomersSelectLabel = document.getElementById("trade-customers-select-label");
var paid, breadTypeQtyListItemsFetched, trade, breadTypesQty

tradeCheckbox.addEventListener("click", () => {
    if (tradeCheckbox.checked){
        tradeOptions.style.display = "block";
        retailOptions.style.display = "none";
        trade = true;
    }
    if (!tradeCheckbox.checked) {
        tradeOptions.style.display = "none";
        retailOptions.style.display = "block";
        trade = false;
    }
})

// To set page to trade by default
tradeCheckbox.click();

function createCustomerSelectOptions(customers) {
    const tradeCustomersSelectOptionsLength = tradeCustomersSelectOptions.length;

    if (tradeCustomersSelectOptions !== undefined) {
        for (let i = 0; i < tradeCustomersSelectOptionsLength; i++){
            document.getElementById(`trade-customers-option-${i}`).remove();
        }
    }
    for (let i = 0; i < customers.length; i++) {
        const option = document.createElement("option");
        option.value = customers[i].name;
        option.innerText = customers[i].name;
        option.id = `trade-customers-option-${i}`;
        option.classList.add("trade-customer-select-option");
        tradeCustomersSelect.appendChild(option);
    }
}

function addOrder () {
    const selectedCustomerIndex = tradeCustomersSelect.selectedIndex;
    const selectedCustomer = tradeCustomersSelect.options[selectedCustomerIndex];
    
    breadTypesQty = [];
    const orderDate = document.getElementById("order-date").value;
    const orderComments = document.getElementById("order-comments").value;

    if (paidCheckbox.checked){
        paid = true;
    } else {
        paid = false;
    }

    for (let i = 0; i < globalCustomerData.length; i++) {

    }


    for (let i = 0; i < breadTypeQtyListItemsFetched.length ; i++) {
        let tradePrice;
        if (trade){
            tradePrice = breadTypes[i].retailPrice - (
                // selectedCustomerIndex - 1 is needed to account for the 
                // select customer option that is hidden and set by defualt
                globalCustomerData[selectedCustomerIndex - 1].tradePriceFormula * 
                breadTypes[i].retailPrice
                )
        }
        if (!trade) {
            tradePrice = 0.00;
        }

        breadTypesQty.push({ 
            name: breadTypes[i].name,
            quantity: document.getElementById(`${breadTypes[i].name}-qty-input`).value,
            tradePrice: tradePrice,
            retailPrice: breadTypes[i].retailPrice
        });
    }
    let orderName;

    if (trade){
        orderName = selectedCustomer.value;
    }
    if (!trade) {
        orderName = document.getElementById("order-name").value;
    }

    const orderValues = { 
        orderName: orderName, 
        orderDate: orderDate, 
        breadTypesQty: breadTypesQty, 
        orderComments: orderComments,
        paid: paid,
        };
    window.electronAPI.addOrder(orderValues);

}

window.electronAPI.addOrderSatus((event,status) => {
    let orderNameLabel;
    if (trade) {
        orderNameLabel = tradeCustomersSelectLabel;
    }
    if (!trade) {
        orderNameLabel = inputBoxLabelOrderName;
    }

    if (status == "ok") {
        nameInputLabel.style.color = "black";
        orderName.placeholder = "";
        inputBoxLabelOrderDate.innerText = "Order Date";
        inputBoxLabelOrderDate.style.color = "black";

        for (let i = 0; i < breadTypeQtyListItemsFetched.length ; i++) {
            document.getElementById(`${breadTypes[i].name}-qty-input`).value = "" ;  
        }
        
        document.getElementById("order-name").value = "";       
        document.getElementById("order-comments").value = "";
        paidCheckbox.checked = false;
        defaultOption.selected = true;

    } 
    
    if (status == "no-name") {
        orderNameLabel.style.color = "red";
        orderName.placeholder = "Enter an order name";
        inputBoxLabelOrderDate.innerText = "Order Date";
        inputBoxLabelOrderDate.style.color = "black";


    }
    
    if (status == "no-date") {
        inputBoxLabelOrderDate.innerText = "Enter an order date";
        inputBoxLabelOrderDate.style.color = "red";
        orderNameLabel.style.color = "black";
        orderName.placeholder = "";
    }
    
    if (status == "no-name-and-no-date") {
        orderNameLabel.style.color = "red";
        orderName.placeholder = "Enter an order name";
        inputBoxLabelOrderDate.innerText = "Enter an order date";
        inputBoxLabelOrderDate.style.color = "red";
    }

})

