
const standingOrderCheckBox = document.getElementById("standing-order-checkbox");
const standingOrderFields = document.getElementById("standing-order-fields");
const paidCheckbox = document.getElementById("paid-checkbox");
const unpaidOrdersTableContainer = document.getElementById("unpaid-orders-list");

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

// loads unpaid orders list when mongo db connection is established 
window.electronAPI.mongooseConnectionEstablished((event, connection) => {
    window.electronAPI.updateUnpaidOrders(); 
})  

// populates unpaid orders table when values are received
window.electronAPI.receiveUnpaidOrders((event, unpaidOrdersValues) => {
    const unpaidOrdersTableFromHtml = document.getElementById("unpaid-orders-table");
    
    // Removes unpaid orders table if it exists to allow for updating
    if(unpaidOrdersTableFromHtml !== null){
        unpaidOrdersTableFromHtml.remove();
    }

    const unpaidOrdersTable = document.createElement("table");
    unpaidOrdersTable.id = "unpaid-orders-table";
    unpaidOrdersTableContainer.appendChild(unpaidOrdersTable);

    const headerTr = document.createElement("tr");
    unpaidOrdersTable.appendChild(headerTr);

    const nameTh = document.createElement("th");
    nameTh.innerText = "Name";
    headerTr.appendChild(nameTh);

    const dateTh = document.createElement("th");
    dateTh.innerText = "Date";
    headerTr.appendChild(dateTh);

    const balanceDueTradeTh = document.createElement("th");
    balanceDueTradeTh.innerText = "Retail";
    headerTr.appendChild(balanceDueTradeTh);

    const balanceDueRetailTh = document.createElement("th");
    balanceDueRetailTh.innerText = "Trade";
    headerTr.appendChild(balanceDueRetailTh);

    const paidTh = document.createElement("th");
    paidTh.innerText = "Paid";
    headerTr.appendChild(paidTh);


    for (let i = 0; i < unpaidOrdersValues.length; i++) {

        const tr = document.createElement("tr");
        unpaidOrdersTable.appendChild(tr);

        const nameTd = document.createElement("td");
        nameTd.innerText = unpaidOrdersValues[i].orderName;
        tr.appendChild(nameTd);

        const dateTd = document.createElement("td");
        dateTd.innerText = formatDate(unpaidOrdersValues[i].orderDate);
        tr.appendChild(dateTd);

        const balanceDueTradeTd = document.createElement("td");
        balanceDueTradeTd.innerText = `£${((unpaidOrdersValues[i].totalAmountDueTrade) / 100).toFixed(2)}`;
        tr.appendChild(balanceDueTradeTd);

        const balanceDueRetailTd = document.createElement("td");
        balanceDueRetailTd.innerText = `£${((unpaidOrdersValues[i].totalAmountDueRetail) / 100).toFixed(2)}`;
        tr.appendChild(balanceDueRetailTd);


        const paidTd = document.createElement("td");
        tr.appendChild(paidTd);

        const paidCheckbox = document.createElement("input");
        paidCheckbox.type = "checkbox";
        paidCheckbox.checked = unpaidOrdersValues[i].paid;
        paidCheckbox.id = `paidCheckbox${i}`;
        paidCheckbox.onclick = () => orderPaid(unpaidOrdersValues[i].id, i);
        paidTd.appendChild(paidCheckbox);
    }
})

// changes order to paid status when paid box is checked
function orderPaid(id, index) {
    checked = document.getElementById(`paidCheckbox${index}`).checked;
    if (checked === true) {
        window.electronAPI.updateOrderToPaid(id);

    }
}

// Runs update function when called for by main process
window.electronAPI.update((event, message) => {
    update()
})

// updates results and tables when called for
function update() {
    // Updates unpaid orders table in dashboard tab
    window.electronAPI.updateUnpaidOrders(); 

    // Updates search results 
    searchOrdersButton.click();


}