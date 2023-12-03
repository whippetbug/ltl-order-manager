const {app, BrowserWindow, ipcMain } = require("electron");
const urls = require("./urls.json");
const path = require("path");
const mongoose = require("mongoose");
const breadTypes = require("./models/bread-types");
const order = require("./models/order");
const customer = require("./models/customer");
const { openOrderDetails } = require("./scripts/order-details.js")

var fetchBreadTypes, win;

const createWindow = () => {
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        icon: "icons/icon.png",
        webPreferences: {
            preload: path.join(__dirname, "scripts/preload.js"),
        }
    });

    win.loadFile("index.html").then(() => { mongooseConnect() });
    exports.mainWindow = win;

    fetchBreadTypes  = async () => {
        
        try {
            let breadTypesForList = [];
            const fetchedBreadTypes = await breadTypes.find({});
            // Array needed to send data to renderer process successfully 
            for (let i = 0; i < fetchedBreadTypes.length; i++){
                const id = (fetchedBreadTypes[i]._id).toString();
                const name = fetchedBreadTypes[i].name;
                const retailPrice = fetchedBreadTypes[i].retailPrice;
                const tradePrice = fetchedBreadTypes[i].tradePrice;

                breadTypesForList.splice( i, 0, { id: id, name: name, tradePrice: tradePrice, retailPrice: retailPrice});
            }

            win.webContents.send("update-bread-list", breadTypesForList);

        } catch (error) {
            console.log(error);
        }
    
    }

    const mongooseConnect = async () => {
        try {
            await mongoose.connect(urls.database_url);
            fetchBreadTypes();
            handleUpdateUnpaidOrders();
            handleFetchCustomerData();

            win.webContents.send("mongoose-connection-established", true);
            console.log("Mongoose connection established");
        } catch (error) {
            console.log(error);
        }
    }
}

// updates tables and results in renderer process
function update() {
    win.webContents.send("update", "message");
}

async function handleSaveBreadType (event, passedBreadType) {   
    try {
        const breadTypeForSave = new breadTypes(passedBreadType);
        await breadTypeForSave.save();
        fetchBreadTypes();
        } catch (error) {
        console.log(error._message);
    }
        
}

async function handleDeleteBreadType (event, breadTypeId){
    try {
        await breadTypes.deleteOne({ _id: breadTypeId });
        fetchBreadTypes();
    } catch (error) {
        console.log(error.message);
    }
}
 
async function handleAddOrder (event, orderValuesSent) {
    let orderValues = orderValuesSent

    // Defaults any empty quantities to zero
    for ( let i = 0; i < orderValues.breadTypesQty.length; i ++) {
        if (orderValues.breadTypesQty[i].quantity == ""){
            orderValues.breadTypesQty[i].quantity = 0 ;
        }
    }

    const noName = orderValues.orderName == "" || orderValues.orderName == "none";
    const noDate = orderValues.orderDate == "" 

    if (orderValues.orderName != "" && orderValues.orderDate != "") {
        
        try {
            const orderForSave = new order(orderValues);
            await orderForSave.save();
            win.webContents.send("add-order-status", "ok");
            update()
        } catch (error) {
            console.log(error);
        }
    }else if (noName && noDate) {
        win.webContents.send("add-order-status", "no-name-and-no-date");

    }else if (noName) {
        win.webContents.send("add-order-status", "no-name");

    }else if (noDate) {
        win.webContents.send("add-order-status", "no-date");
    }
}

// Arrray needed to send data to renderer process successfully 
function sendSearchResults(orderSearchResults){
    let orderSearchResultsForSend = [];
        let breadTypesQty = [];
        for (let i = 0; i < orderSearchResults.length; i++) {
            breadTypesQty = [];
            const id = (orderSearchResults[i]._id).toString();
            const orderDate = orderSearchResults[i].orderDate;
            const orderName = orderSearchResults[i].orderName;
            const breadTypesQtyFetched = orderSearchResults[i].breadTypesQty;
            const orderComments = orderSearchResults[i].orderComments;
            const paid = orderSearchResults[i].paid;
            const standingOrder = orderSearchResults[i].standingOrder;
            let totalAmountDueRetail = 0;
            let totalAmountDueTrade = 0;

            for (let j = 0; j < orderSearchResults[i].breadTypesQty.length; j++) {
                totalAmountDueRetail = totalAmountDueRetail + (orderSearchResults[i].breadTypesQty[j].retailPrice * orderSearchResults[i].breadTypesQty[j].quantity);
                totalAmountDueTrade = totalAmountDueTrade + (orderSearchResults[i].breadTypesQty[j].tradePrice * orderSearchResults[i].breadTypesQty[j].quantity);
            }
        
            for ( let j = 0; j < breadTypesQtyFetched.length; j++){
                breadTypesQty.splice(j, 0, { 
                    name: breadTypesQtyFetched[j].name, 
                    quantity: breadTypesQtyFetched[j].quantity,
                    tradePrice: breadTypesQtyFetched[j].tradePrice,
                    retailPrice: breadTypesQtyFetched[j].retailPrice,
                });
            }

            orderSearchResultsForSend.splice(i, 0, { 
                id: id,
                orderDate: orderDate, 
                orderName: orderName, 
                breadTypesQty: breadTypesQty,
                totalAmountDueRetail: totalAmountDueRetail,
                totalAmountDueTrade: totalAmountDueTrade,
                orderComments: orderComments,
                paid: paid,
                standingOrder: standingOrder,
            });
        }
        win.webContents.send("update-order-search-results", orderSearchResultsForSend);
}

//Searches orders in database on specific date 
async function handleSearchOrdersDate (event, date) {
    try {
        const orderSearchResults = await order.find({ orderDate: date});
        sendSearchResults(orderSearchResults)
    } catch (error) {
        console.log(error);
    }
}

// Searches orders in database with specific name
async function handleSearchOrdersName (event, name) {
    try {
        const orderSearchResults = await order.find({ orderName: name});
        sendSearchResults(orderSearchResults);
    } catch (error) {
        console.log(error);
    }
}

// Searces orders in database with specific name on a certain date
async function handleSearchOrdersName1Date (event, name, date) {
    try {
        const orderSearchResults = await order.find({$and: [{orderName: name}, {orderDate: date}]});
        sendSearchResults(orderSearchResults);
    } catch (error) {
        console.log(error);
    }
}

// Searches orders in database with specific name between two dates 
async function handleSearchOrdersName2Dates (event, name, startDate, endDate) {
    try {
        const orderSearchResults = await order.find({ $and: [ {orderName: name}, {orderDate: {$gte: startDate, $lte: endDate}}]});
        sendSearchResults(orderSearchResults);
    } catch (error) {
        console.log(error);
    }
}

// Searches orders between two dates 
async function handleSearchOrdersBetweenDates (event, startDate, endDate) {
    try {
        const orderSearchResults = await order.find({ orderDate: {$gte: startDate, $lte: endDate}});
        sendSearchResults(orderSearchResults);
    } catch (error) {
        console.log(error);
    }
}

async function handleUpdateBreadType(event, updatedBreadTypeValues) {
    try {
        await breadTypes.updateOne({
            _id: updatedBreadTypeValues.id,
        },
        { $set: 
            {
                name: updatedBreadTypeValues.name,
                tradePrice: updatedBreadTypeValues.tradePrice,
                retailPrice: updatedBreadTypeValues.retailPrice,
            }
        });
        fetchBreadTypes();
    } catch (error) {
        console.log(error);
    }
}

async function handleSaveEditedOrder (event, valuesForSave) {
    try {
        await order.updateOne(
            { 
                _id: valuesForSave.id
            },
            {
                $set: {
                    orderName: valuesForSave.orderName, 
                    orderDate: valuesForSave.orderDate, 
                    orderComments: valuesForSave.orderComments,
                    breadTypesQty: valuesForSave.breadTypesQty,
                    paid: valuesForSave.paid,
    
                }
            } )
    
        win.webContents.send("request-order-search-results", "message");
        update();
    } catch (error) {
        console.log(error);
    }
}

async function handleDeleteOrder(event, orderValues) {
    try {
        await order.deleteOne({ _id: orderValues.id });
        win.webContents.send("request-order-search-results", "message");
        update();

    } catch (error) {
        console.log(error);
    }
}

async function updateUnpaidOrders() {
    try {
        const unpaidOrderValues = await order.find({ paid: false});
        let valuesForSend = [];
        let breadTypesQty = [];
        
        for (let i = 0; i < unpaidOrderValues.length; i++ ) {
            breadTypesQty = [];
            let totalAmountDueRetail = 0;
            let totalAmountDueTrade = 0;
            let breadTypesQtyFetched = unpaidOrderValues[i].breadTypesQty;

            for (let j = 0; j < unpaidOrderValues[i].breadTypesQty.length; j++) {
                totalAmountDueRetail = totalAmountDueRetail + (unpaidOrderValues[i].breadTypesQty[j].retailPrice * unpaidOrderValues[i].breadTypesQty[j].quantity);
                totalAmountDueTrade = totalAmountDueTrade + (unpaidOrderValues[i].breadTypesQty[j].tradePrice * unpaidOrderValues[i].breadTypesQty[j].quantity);
            }

            for ( let j = 0; j < breadTypesQtyFetched.length; j++){
                breadTypesQty.splice(j, 0, { 
                    name: breadTypesQtyFetched[j].name, 
                    quantity: breadTypesQtyFetched[j].quantity,
                    tradePrice: breadTypesQtyFetched[j].tradePrice,
                    retailPrice: breadTypesQtyFetched[j].retailPrice,
                });
            }

            valuesForSend.push({ 
                orderName: unpaidOrderValues[i].orderName, 
                orderDate: unpaidOrderValues[i].orderDate,
                breadTypesQty: breadTypesQty,
                totalAmountDueRetail: totalAmountDueRetail,
                totalAmountDueTrade: totalAmountDueTrade, 
                paid: unpaidOrderValues[i].paid,
                orderComments: unpaidOrderValues[i].orderComments,
                id: (unpaidOrderValues[i]._id).toString(),
            })
        }
        win.webContents.send("receive-unpaid-orders", valuesForSend);

    } catch (error) {
        console.log(error);
    }
}

// runs update unpaid orders function when called for by render process 
function handleUpdateUnpaidOrders(event) {
    updateUnpaidOrders();
}

async function handleUpdateOrderToPaid(event, id) {
    await order.updateOne({ _id: id }, { $set: { paid: true }});
    updateUnpaidOrders();
    update();
}

async function handleSaveCustomer(event, customerName, tradePriceFormula) {
    const okStatus = customerName !== "" && tradePriceFormula !== 0;
    const noNameStatus = customerName == "" && tradePriceFormula !== 0;
    const noFormulaStatus = customerName !== "" && tradePriceFormula == 0;

    if (okStatus){
        try {
            const customerForSave = new customer({name: customerName, tradePriceFormula: tradePriceFormula});
            await customerForSave.save();
            win.webContents.send("add-customer-status", "ok");
            handleFetchCustomerData();
            return
        } catch (error) {
            console.log(error);
        }  
    }
    if (noNameStatus){
        win.webContents.send("add-customer-status", "no-name");
        return
    }
    if (noFormulaStatus){
        win.webContents.send("add-customer-status", "no-formula");
        return
    }
    win.webContents.send("add-customer-status", "empty");
 
}

async function handleFetchCustomerData(event) {
    const customerData = await customer.find({});
    
    // Array needed to successfully send data to renderer process 
    let customerDataForSend = [];
    for (let i = 0; i < customerData.length; i++) {
        const name = customerData[i].name;
        const formula = customerData[i].tradePriceFormula;

        customerDataForSend.push(
            { 
                name: name, 
                tradePriceFormula: formula, 
                id: customerData[i]._id.toString(), 
            }
        )
    }
    win.webContents.send("return-customer-data", customerDataForSend);
}

async function handleDeleteCustomer(event, customerId) {
    try {
         await customer.deleteOne({ _id: customerId });
         handleFetchCustomerData();
    } catch (error) {
        console.log(error)
    }
       
}

async function handleUpdateCustomer(event, customerId, customerName, tradePriceFormula){
    try {
        await customer.updateOne(
            { 
                _id: customerId
            },
            {
                $set: {
                    name: customerName,
                    tradePriceFormula: tradePriceFormula,    
                }
            } )
        handleFetchCustomerData();
    } catch (error) {
       console.log(error) 
    }
}

function handleOpenOrderDetails(event, orderDetails){
    openOrderDetails(orderDetails);
}

app.whenReady().then(() => {
    ipcMain.on("save-bread-type", handleSaveBreadType);
    ipcMain.on("delete-bread-type", handleDeleteBreadType);
    ipcMain.on("add-order", handleAddOrder);
    ipcMain.on("search-orders-date", handleSearchOrdersDate);
    ipcMain.on("search-orders-name", handleSearchOrdersName);
    ipcMain.on("search-orders-name-1-date", handleSearchOrdersName1Date);
    ipcMain.on("search-orders-name-2-dates", handleSearchOrdersName2Dates);
    ipcMain.on("search-orders-between-dates", handleSearchOrdersBetweenDates),
    ipcMain.on("update-bread-type", handleUpdateBreadType);
    ipcMain.on("save-edited-order", handleSaveEditedOrder);
    ipcMain.on("delete-order", handleDeleteOrder);
    ipcMain.on("update-unpaid-orders", handleUpdateUnpaidOrders);
    ipcMain.on("update-order-to-paid", handleUpdateOrderToPaid);
    ipcMain.on("save-customer", handleSaveCustomer);
    ipcMain.on("fetchCustomerData", handleFetchCustomerData);
    ipcMain.on("delete-customer", handleDeleteCustomer);
    ipcMain.on("update-customer", handleUpdateCustomer);
    ipcMain.on("open-order-details", handleOpenOrderDetails);
    createWindow();

    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0 ){
            createWindow();
        }
    })

    app.on("window-all-closed", () => {
        if(process.platform !== "darwin"){
            app.quit();
        }
    })
})



