const searchOrdersButton = document.getElementById("search-orders-button");
const dateSearch = document.getElementById("date-search");
const tableContainer = document.getElementById("table-container");
const orderEditPopup = document.getElementById("order-edit-popup");
const orderNameUpdated = document.getElementById("order-name-updated");
const orderDateUpdated = document.getElementById("order-date-updated");
const paidUpdated = document.getElementById("paid-updated");
const orderCommentsUpdated = document.getElementById("order-comments-updated");
const deleteOrderButton = document.getElementById("delete-order-button");
const nameSearch = document.getElementById("name-search");
const nameSearchStartDate = document.getElementById("name-search-start-date");
const nameSearchEndDate = document.getElementById("name-search-end-date");
const orderName = document.getElementById("order-name");

// converts date to format dd/mm/yyyy
function formatDate(dateValue) { 
    let date = new Date(dateValue);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10 ){
        month = "0" + month;
    }
    if (day < 10 ){
        day = "0" + day;
    }
    const formatedDate = `${day}/${month}/${year}`;
    return formatedDate;
}

// Searches orders
searchOrdersButton.addEventListener("click", () => {

    // Sets the search field combination 
    const  isOnlyDate = 
        dateSearch.value !== "" &&
        nameSearch.value === "" &&        
        nameSearchStartDate.value === "" && 
        nameSearchEndDate.value === ""

    const isOnlyName = 
        nameSearch.value !== "" &&
        dateSearch.value === "" &&
        nameSearchStartDate.value === "" && 
        nameSearchEndDate.value === "" 

    const isName1Date = 
        dateSearch.value !== "" && 
        nameSearch.value !== "" && 
        nameSearchStartDate.value === "" && 
        nameSearchEndDate.value === ""

    const isName2Dates = 
        nameSearch.value !== "" && 
        nameSearchStartDate.value !== "" && 
        nameSearchEndDate.value !== "" &&
        dateSearch.value === ""

    const isBetweenDates = 
        nameSearch.value === "" && 
        nameSearchStartDate.value !== "" && 
        nameSearchEndDate.value !== "" &&
        dateSearch.value === ""

    let validCombination = false;

    // Runs correct search depending on search field combination used 
    if (isOnlyDate){
        window.electronAPI.searchOrdersDate(dateSearch.valueAsDate);
        validCombination = true;
    }

    if (isOnlyName){
        window.electronAPI.searchOrdersName(nameSearch.value);
        validCombination = true;
    }

    if (isName1Date){
        window.electronAPI.searchOrdersName1Date(nameSearch.value, dateSearch.valueAsDate);
        validCombination = true;
    }

    if (isName2Dates){
        window.electronAPI.searchOrdersName2Dates(
            nameSearch.value, 
            nameSearchStartDate.valueAsDate, 
            nameSearchEndDate.valueAsDate
            );
        validCombination = true; 
    }

    if (isBetweenDates) {
        window.electronAPI.searchOrdersBetweenDates(
            nameSearchStartDate.valueAsDate, 
            nameSearchEndDate.valueAsDate
            );
        validCombination = true;
    }

    // Throws error if search field combination is invalid 
    if (!validCombination){
        //Removes any error messages already present 
        removeSearchError();
        // Creates error container to allow error message removal 
        const errorContainer = document.createElement("div");
        errorContainer.id = "error-container";
        tableContainer.appendChild(errorContainer);
        //Creates invalid search query message 
        const invalidQueryError = document.createElement("p");
        invalidQueryError.id = "invalid-query-message";
        invalidQueryError.innerText = "Error: Invalid search query";
        errorContainer.appendChild(invalidQueryError);

    }

})

// runs update search results when results are recieved 
window.electronAPI.returnOrderSearchResults((event, orderSearchResults) => {
    updateOrderSearchResults(orderSearchResults);
})

//removes error messages 
function removeSearchError() {
    if (document.getElementById("error-container") != undefined) {
        document.getElementById("error-container").remove();
    }
    //Removes search results table ready for updating 
    if (document.getElementById("order-results-table") != undefined) {
        document.getElementById("order-results-table").remove();
    }

}

//function that updates order search results
function updateOrderSearchResults(orderResults) {

    // Populates an array with all the bread types in the search results
    function findAllBreadTypes(date){
        let breadTypes = [];
        // Populates breadTypes array with each different bread type
        // in the search results  
        for (let i = 0; i < orderResults.length; i++) {
            var breadTypesQtyNames = [];
            
            // Adds the names from the current order results to the array breadTypesQtyNames
            for (let j = 0; j < (orderResults[i].breadTypesQty).length; j++){
                const breadTypeName = (orderResults[i].breadTypesQty[j]).name;
                breadTypesQtyNames.push(breadTypeName)
            }
            // Adds any name that doesn't already exist in the breadTypes array 
            for (let j = 0; j < breadTypesQtyNames.length; j++){
                const correctDate = (orderResults[i].orderDate).toISOString() == date;
                if (!breadTypes.includes(breadTypesQtyNames[j]) && correctDate){
                    breadTypes.push(breadTypesQtyNames[j]);
                }
            }
        }
        return breadTypes;
    }

    // Creates date row in order search results table
    function createDateRow(date){
        //creates date row 
        const dateRow = document.createElement("tr");
        dateRow.id = "date-row";
        table.appendChild(dateRow);
        //creates first row items 
        const dateRowDate = document.createElement("th");
        dateRowDate.innerText = date;
        dateRow.appendChild(dateRowDate);
    }

    // Creates a table row displaying the days total for each bread type
    function createTotalsRow(date){
        
        // Creates totals row
        const totalsTr = document.createElement("tr");
        table.appendChild(totalsTr);

        // Creates label
        const totalsLabel = document.createElement("td");
        totalsLabel.innerText = "Total"
        totalsLabel.classList.add("totals-td")
        totalsTr.appendChild(totalsLabel);

        const allBreadTypes = findAllBreadTypes(date);
        
        var totalBreadTypeQty = {};
        // totalBreadTypesQty object is populated with 
        // each bread type name as a key and a value of 0
        for (let i = 0; i < allBreadTypes.length; i++){
            totalBreadTypeQty[allBreadTypes[i]] = 0;
        }

        // Updates the breadTypesQty object values to the correct quantity
        for (let i = 0; i < orderResults.length; i++){
            const correctDate = (orderResults[i].orderDate).toISOString() == date;
            if (correctDate){
                for (let j = 0; j < (orderResults[i].breadTypesQty).length; j++){               
                    const breadType = (orderResults[i].breadTypesQty[j]).name;
                    totalBreadTypeQty[breadType] = 
                        totalBreadTypeQty[breadType]  
                        +  parseInt((orderResults[i].breadTypesQty[j]).quantity);
                } 
            }
        }
        // Builds a td element for each total quantity in the results table
        for (let i = 0; i < allBreadTypes.length; i++){
            const total = totalBreadTypeQty[allBreadTypes[i]];
            const totalTd = document.createElement("td");
            totalTd.innerText = total;
            totalTd.classList.add("totals-td");
            totalsTr.appendChild(totalTd);
        
        }
        // builds an empty space filling td element
        const emptyTd = document.createElement("td");
        totalsTr.appendChild(emptyTd);
    }

    //removes error messages 
    removeSearchError();

    if (orderResults[0] != undefined ) {  

        var includedDates = [];

        // Populates the includedDates array with all the different dates that appear in the search results
        for ( let i = 0; i < orderResults.length; i++) {

            if(!includedDates.includes((orderResults[i].orderDate).toISOString())){
                includedDates.push((orderResults[i].orderDate).toISOString())
            }
        }
       
        //creates table 
        var table = document.createElement("table");
        table.id = "order-results-table";
        tableContainer.appendChild(table);
        
        

        //Creates order name column
        for (let j = 0; j < includedDates.length; j++){
            
            let newDate = true;
            // declares date variable for totals column
            let totalsDate;
            // Creates date row for each different date in search results
            if(includedDates.length > 0){
                createDateRow(formatDate(includedDates[j]));
                totalsDate = (includedDates[j]);
            }else{
                createDateRow(formatDate(orderResults[0].orderDate));
                totalsDate = (orderResults[0].orderDate).toISOString();
            }
            
            const allBreadTypes = findAllBreadTypes(totalsDate);

            // Creates the bread types and quantities in the search results table
            for ( let i = 0; i < orderResults.length; i++) {
                if((orderResults[i].orderDate).toISOString() == totalsDate){
                    // creates bread types row for each new date 
                    if (newDate){
                        const trName = document.createElement("tr");
                        table.appendChild(trName);

                        // Creates an empty td element to fill space at the start
                        const emptyTd = document.createElement("td");
                        trName.appendChild(emptyTd);
                            
                        for (let k = 0; k < allBreadTypes.length; k++) {
                            const breadTypesNameTd = document.createElement("td");
                            breadTypesNameTd.innerText = allBreadTypes[k];
                            breadTypesNameTd.classList.add("bread-types-name-td");
                            trName.appendChild(breadTypesNameTd);
                        }

                        // Creates an empty td element to fill space at the end 
                        const emptyTdEnd = document.createElement("td");
                        trName.appendChild(emptyTdEnd);
                    }

                    // sets new date to false so bread types will not be displayed
                    // until an new date is displayed
                    newDate = false;

                    const quantitiesTr = document.createElement("tr");
                    table.appendChild(quantitiesTr);
                    // Creates name label
                    const tdName = document.createElement("td");
                    quantitiesTr.appendChild(tdName);
                    const commentsContainer = document.createElement("div");
                    commentsContainer.classList.add("comments-container");
                    tdName.appendChild(commentsContainer);
                    //Creates comments label 
                    const nameLabel = document.createElement("label");
                    nameLabel.innerText = orderResults[i].orderName;
                    nameLabel.classList.add("name-label");
                    commentsContainer.appendChild(nameLabel);
                    //Creates comments popup
                    const commentsPopup = document.createElement("div");
                    commentsPopup.classList.add("comments-popup");
                    commentsContainer.appendChild(commentsPopup);
                    // Creates comments text div
                    const commentsText = document.createElement("div");
                    if (orderResults[i].orderComments == "" || orderResults[i].orderComments == undefined){
                        commentsText.innerText = "This order has no comments";
                    } else {
                        commentsText.innerText = orderResults[i].orderComments;
                    }
                    commentsPopup.appendChild(commentsText);

                    // Gets the correct quantity for the breadTypesQtyTd element 
                    for (let j = 0; j < allBreadTypes.length; j++) {
                        let breadTypesQtyData = 0;
                        for(let k = 0; k < (orderResults[i].breadTypesQty).length; k++){
                            try {
                                if (orderResults[i].breadTypesQty[k].name == allBreadTypes[j]){
                                    breadTypesQtyData = orderResults[i].breadTypesQty[k].quantity;
                                }
                                
                            } catch (error) {
                                breadTypesQtyData = 0;
                            }
                        }
                        // Creates table data element for the bread type quantity
                        const breadTypesQtyTd = document.createElement("td");
                        breadTypesQtyTd.innerText = breadTypesQtyData;
                        breadTypesQtyTd.classList.add("bread-types-qty-td");
                        quantitiesTr.appendChild(breadTypesQtyTd);
                    }

                    // Creates edit button table data element
                    const tdEdit = document.createElement("td");
                    quantitiesTr.appendChild(tdEdit);

                    // Creates edit button
                    const editLabel = document.createElement("Label");
                    editLabel.classList.add("edit-label");
                    editLabel.style.textDecoration = "underline";
                    editLabel.innerText = "Edit";
                    editLabel.onclick = () => {editOrder(orderResults[i])}
                    tdEdit.appendChild(editLabel);                 
                }
            }
            
            //adds totals row
            createTotalsRow(totalsDate);
        }

    } else {
        // Creates error container to allow error message removal 
        const errorContainer = document.createElement("div");
        errorContainer.id = "error-container";
        tableContainer.appendChild(errorContainer);

        //Creates no orders logged message 
        const noOrdersForTodayWarning = document.createElement("p");
        noOrdersForTodayWarning.id = "no-orders-warning";
        noOrdersForTodayWarning.innerText = "There are no logged orders for the selected date";
        errorContainer.appendChild(noOrdersForTodayWarning);
    }


}

//shows and hides standing order fields
standingOrderCheckBox.addEventListener("change", () => {
    if (standingOrderCheckBox.checked == true) {
        standingOrderFields.style.display = "block";
    }else {
        standingOrderFields.style.display = "none";
    }
})

// Function for opening edit order popup
function editOrder(orderValues) {
    orderEditPopup.classList.add("show-popup");
    //removes input box container if it already exists
    const breadTypeQtyInputBoxUpdatedContainerFromHtml = document.getElementById("bread-type-qty-input-updated-container")
    if (breadTypeQtyInputBoxUpdatedContainerFromHtml != undefined) {
        breadTypeQtyInputBoxUpdatedContainerFromHtml.remove()
        }
    // creates temporary cotainer for input boxes that is removed when the popup is closed
    const breadTypeQtyInputBoxUpdatedContainer = document.createElement("div")
    breadTypeQtyInputBoxUpdatedContainer.id = "bread-type-qty-input-updated-container"
    breadTypesQtyUpdated.appendChild(breadTypeQtyInputBoxUpdatedContainer)
    for ( let i = 0; i < orderValues.breadTypesQty.length; i++) {
        // Creates bread types quantity update input box label
        const breadTypeQtyInputBoxUpdatedLabel = document.createElement("label");
        breadTypeQtyInputBoxUpdatedLabel.innerText = orderValues.breadTypesQty[i].name;
        breadTypeQtyInputBoxUpdatedLabel.classList.add("input-box-label");
        breadTypeQtyInputBoxUpdatedContainer.appendChild(breadTypeQtyInputBoxUpdatedLabel)

        // Creates bread types quantity update input box
        const breadTypeQtyInputBoxUpdated = document.createElement("input");
        breadTypeQtyInputBoxUpdated.type = "number";
        breadTypeQtyInputBoxUpdated.classList.add("input-box");
        breadTypeQtyInputBoxUpdated.id = (`${orderValues.breadTypesQty[i].name}-input-box-updated`);
        breadTypeQtyInputBoxUpdated.value = orderValues.breadTypesQty[i].quantity;
        breadTypeQtyInputBoxUpdated.placeholder = "Quantity";
        breadTypeQtyInputBoxUpdatedContainer.appendChild(breadTypeQtyInputBoxUpdated);
    }

    //sets values to input fields 
    orderNameUpdated.value = orderValues.orderName;
    orderDateUpdated.valueAsDate = orderValues.orderDate;
    orderCommentsUpdated.value = orderValues.orderComments;
    paidUpdated.checked = orderValues.paid;

    
    // Adds onclick event to save button for order edit
    document.getElementById("save-order-edit-button").onclick = () => {saveOrderEdit(orderValues)};

    // adds click listner to cancel and delete order buttons 
    document.getElementById("cancel-order-edit").onclick = () => {cancelOrderEdit()};
    deleteOrderButton.onclick = () => {confirmDeleteOrder(orderValues)}

}

// Function for cancelling order edit 
function cancelOrderEdit() {
    orderEditPopup.classList.remove("show-popup");
    document.getElementById("bread-type-qty-input-updated-container").remove();
}

// Saves changes made to order
function saveOrderEdit(orderValues) {
    //builds order values for saving 
    const id = orderValues.id;
    const editedOrderDate = orderDateUpdated.value;
    const editedOrderName = orderNameUpdated.value;
    const editedPaid = paidUpdated.checked;
    const editedComments = orderCommentsUpdated.value; 
    let editedBreadTypesQty = [];

    for ( let i = 0; i < orderValues.breadTypesQty.length; i++) {
        const editedQuantity = document.getElementById(`${orderValues.breadTypesQty[i].name}-input-box-updated`).value;
        const editedName = orderValues.breadTypesQty[i].name;
        const retailPrice = orderValues.breadTypesQty[i].retailPrice;
        const tradePrice = orderValues.breadTypesQty[i].tradePrice;

        editedBreadTypesQty.push({
            name: editedName,
            quantity: editedQuantity,
            retailPrice: retailPrice,
            tradePrice: tradePrice,
        });
    }

    //builds object for saving
    const orderValuesForSave = {
        id: id,
        orderName: editedOrderName,
        orderDate: editedOrderDate,
        paid: editedPaid,
        orderComments: editedComments,
        breadTypesQty: editedBreadTypesQty,
    }

    window.electronAPI.editOrder(orderValuesForSave);
    orderEditPopup.classList.remove("show-popup");
    searchOrdersButton.click();

}

//updates order search results
window.electronAPI.requestOrderSearchResults((event, message) => {
    searchOrdersButton.click();

})

// Shows popup to make sure that you want to delete the order 
function confirmDeleteOrder(orderValues) {
    if (confirm("Are you sure you want to delete this order?") == true){
        deleteOrder(orderValues);
        cancelOrderEdit();
        searchOrdersButton.click();
    }
        
}

// deletes the selected order
function deleteOrder(orderValues) {
    window.electronAPI.deleteOrder(orderValues);
}