const dynamicDetails = document.getElementById("dynamic-details");
const staticDetails = document.getElementById("static-details");

// Can't find function if function is loaded in html file
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

window.onload = () => {
    window.orderDetailsAPI.fetchDetails("fetch-details");
}

window.orderDetailsAPI.orderDetails((event, orderDetails) => {renderOrderDetails(orderDetails)});

function renderOrderDetails(orderDetails){
    const dynamicContainer = document.getElementById("dynamic-details-list");
    const staticContainer = document.getElementById("static-details-list");
    let orderComments = "There are no comments on this order";
    let orderPaid = "No";

    if (staticContainer != null){
        staticContainer.remove();
        dynamicContainer.remove();
    }

    if (orderDetails.paid){
        orderPaid = "Yes";
    }

    if (orderDetails.orderComments != ""){
        orderComments = orderDetails.orderComments;
    }

    const staticDetailsList = document.createElement("ul");
    staticDetailsList.id = "static-details-list";
    staticDetails.appendChild(staticDetailsList);

    const dynamicDetailsList = document.createElement("ul");
    dynamicDetailsList.id = "dynamic-details-list";
    dynamicDetails.appendChild(dynamicDetailsList);


    const orderNameLi = document.createElement("li");
    orderNameLi.innerText = `Order Name: ${orderDetails.orderName}`
    orderNameLi.classList.add("order-detail");
    staticDetailsList.appendChild(orderNameLi);

    const orderDate  = formatDate(orderDetails.orderDate);
    const orderDateLi = document.createElement("li");
    orderDateLi.innerText = `Order Date: ${orderDate}`
    orderDateLi.classList.add("order-detail");
    staticDetailsList.appendChild(orderDateLi);

    const orderPaidLi = document.createElement("li");
    orderPaidLi.innerText = `Paid: ${orderPaid}`
    orderPaidLi.classList.add("order-detail");
    staticDetailsList.appendChild(orderPaidLi);

    const orderTotalTradeLi = document.createElement("li");
    orderTotalTradeLi.innerText = `Trade total: £${((orderDetails.totalAmountDueTrade) / 100).toFixed(2)}`;
    orderTotalTradeLi.classList.add("order-detail");
    staticDetailsList.appendChild(orderTotalTradeLi);

    const orderTotalRetailLi = document.createElement("li");
    orderTotalRetailLi.innerText = `Retail total: £${((orderDetails.totalAmountDueRetail) / 100).toFixed(2)}`;
    orderTotalRetailLi.classList.add("order-detail");
    staticDetailsList.appendChild(orderTotalRetailLi);

    const orderCommentsLi = document.createElement("li");
    orderCommentsLi.innerText = `Comments: 
    ${orderComments}`;
    staticDetailsList.appendChild(orderCommentsLi);

    for (let i = 0; i < orderDetails.breadTypesQty.length; i++ ){
        const breadTypeQtyListItemLi = document.createElement("li");
        breadTypeQtyListItemLi.innerText = 
            `${orderDetails.breadTypesQty[i].name}: ${orderDetails.breadTypesQty[i].quantity}`;
        breadTypeQtyListItemLi.classList.add("order-detail")
        dynamicDetailsList.appendChild(breadTypeQtyListItemLi);
    }
}