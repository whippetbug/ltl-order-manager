const inputBoxLabelOrderDate = document.getElementById("input-box-label-order-date");
const inputBoxLabelOrderName = document.getElementById("input-box-label-order-name");
var paid, breadTypeQtyListItemsFetched, standingOrder

//add order function 
function addOrder () {
    //empties the breadTypesQty array ready for updating 
    breadTypesQty = [];
    const orderName = document.getElementById("order-name").value;
    const orderDate = document.getElementById("order-date").value;
    const orderComments = document.getElementById("order-comments").value;

    
    
    // Assignes boolean value to the state of the paid checkbox
    if (paidCheckbox.checked == true){
        paid = true;
    } else {
        paid = false;
    }

    // Assignes boolean value to the state of standingOrder checkbox 
    if (standingOrderCheckBox.checked == true) {
        standingOrder = true;
    } else {
        standingOrder = false;
    }

    for (let i = 0; i < breadTypeQtyListItemsFetched.length ; i++) {
        breadTypesQty.push({ 
            name: breadTypes[i].name,
            quantity: document.getElementById(`${breadTypes[i].name}-qty-input`).value,
            tradePrice: breadTypes[i].tradePrice, 
            retailPrice: breadTypes[i].retailPrice 
        });
    }
    const orderValues = { 
        orderName: orderName, 
        orderDate: orderDate, 
        breadTypesQty: breadTypesQty, 
        orderComments: orderComments,
        paid: paid,
        standingOrder: standingOrder,
        };
    window.electronAPI.addOrder(orderValues);

}

window.electronAPI.addOrderSatus((event,status) => {
    //function to clear imput boxes when all is ok
    if (status == "ok") {
        //sets labels for input boxes to default in case of error changing their style
        inputBoxLabelOrderDate.style.color = "black";
        document.getElementById("order-name").placeholder = "";
        inputBoxLabelOrderDate.innerText = "Order Date";
        inputBoxLabelOrderDate.style.color = "black";


        //Clears quantity input boxes
        for (let i = 0; i < breadTypeQtyListItemsFetched.length ; i++) {
            document.getElementById(`${breadTypes[i].name}-qty-input`).value = "" ;  
        }
        //Clears name input box
        document.getElementById("order-name").value = "";
        // Clears comments box 
        document.getElementById("order-comments").value = "";
        // Unchecks check boxes 
        paidCheckbox.checked = false;
        standingOrderCheckBox.checked = false;
        // Hides standing order fields 
        standingOrderFields.style.display = "none";

    } 
    
    if (status == "no-name") {
        //Throws error if no order name is supplied 
        inputBoxLabelOrderDate.style.color = "red";
        orderName.placeholder = "Enter an order name";
        inputBoxLabelOrderDate.innerText = "Order Date";
        inputBoxLabelOrderDate.style.color = "black";


    }
    
    if (status == "no-date") {
        //Throws error if no date is supplied 
        inputBoxLabelOrderDate.innerText = "Enter an order date";
        inputBoxLabelOrderDate.style.color = "red";
        inputBoxLabelOrderName.style.color = "black";
        orderName.placeholder = "";
    }
    
    if (status == "no-name-and-no-date") {
        // Throws error if both no name and no date are supplied 
        inputBoxLabelOrderName.style.color = "red";
        orderName.placeholder = "Enter an order name";
        inputBoxLabelOrderDate.innerText = "Enter an order date";
        inputBoxLabelOrderDate.style.color = "red";
    }
})

//shows and hides standing order fields
standingOrderCheckBox.addEventListener("change", () => {
    if (standingOrderCheckBox.checked == true) {
        standingOrderFields.style.display = "block";
    }else {
        standingOrderFields.style.display = "none";
    }
})
