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

window.electronAPI.receiveUnpaidOrders((event, unpaidOrdersValues) => {
    const unpaidOrderValuesExist = unpaidOrdersValues.length > 0;
    const unpaidOrdersTableFromHtml = document.getElementById("unpaid-orders-table");
    const noUnpaidOrdersMessageFromHtml = document.getElementById("no-unpaid-orders-message");

    if (noUnpaidOrdersMessageFromHtml != null){
        noUnpaidOrdersMessageFromHtml.remove()
    }
    
    // Needed to stop unpaid orders table being displayed twice when it is updated
    if(unpaidOrdersTableFromHtml != null){
        unpaidOrdersTableFromHtml.remove();
    }
    
    if(unpaidOrderValuesExist){

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
        balanceDueTradeTh.innerText = "Trade";
        headerTr.appendChild(balanceDueTradeTh);

        const balanceDueRetailTh = document.createElement("th");
        balanceDueRetailTh.innerText = "Retail";
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
    }
    if (!unpaidOrderValuesExist) {
        const noUnpaidOrdersMessage = document.createElement("p");
        noUnpaidOrdersMessage.innerText = "There are no unpaid orders";
        noUnpaidOrdersMessage.id = "no-unpaid-orders-message";
        unpaidOrdersTableContainer.appendChild(noUnpaidOrdersMessage);
    }
})

function orderPaid(id, index) {
    checked = document.getElementById(`paidCheckbox${index}`).checked;
    if (checked === true) {
        window.electronAPI.updateOrderToPaid(id);

    }
}
