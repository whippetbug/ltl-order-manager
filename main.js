const {app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mongoose = require("mongoose");
const breadTypes = require("./models/bread-types");
const order = require("./models/order");

var fetchBreadTypes, win, breadTypesQty;


//Creates new root window
const createWindow = () => {
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "scripts/preload.js")
        }
    });

    //Loads html file then connects to mongoose
    win.loadFile("index.html").then(() => { mongooseConnect() });

    //Fetches bread types
    fetchBreadTypes  = async () => {
        
        try {
            let breadTypesForList = [];
            const fetchedBreadTypes = await breadTypes.find({});
            // Takes wanted fields from db query and adds them to an array of objects
            for (let i = 0; i < fetchedBreadTypes.length; i++){
                const id = (fetchedBreadTypes[i]._id).toString();
                const name = fetchedBreadTypes[i].name;
                const retailPrice = fetchedBreadTypes[i].retailPrice;
                const tradePrice = fetchedBreadTypes[i].tradePrice;

                breadTypesForList.splice( i, 0, { id: id, name: name, tradePrice: tradePrice, retailPrice: retailPrice});
            }
            //Sends ipc message and array to reneder process
            win.webContents.send("update-bread-list", breadTypesForList);

        } catch (error) {
            console.log(error);
        }
    
    }

    //Connects to mongoose 
    const mongooseConnect = async () => {
        try {
            await mongoose.connect("mongodb://localhost/ltlordersdb");
            await fetchBreadTypes();
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

//Saves new bread type to database
async function handleSaveBreadType (event, passedBreadType) {   
    try {
        const breadTypeForSave = new breadTypes(passedBreadType);
        await breadTypeForSave.save();
        fetchBreadTypes();
        } catch (error) {
        console.log(error._message);
    }
        
}

//Deletes bread type 
async function handleDeleteBreadType (event, breadTypeId){
    try {
        await breadTypes.deleteOne({ _id: breadTypeId });
        fetchBreadTypes();
    } catch (error) {
        console.log(error.message);
    }
}

//Adds new order to db 
async function handleAddOrder (event, orderValuesSent) {
    let orderValues = orderValuesSent

    // Defaults any empty quantities to zero
    for ( let i = 0; i < orderValues.breadTypesQty.length; i ++) {
        if (orderValues.breadTypesQty[i].quantity == ""){
            orderValues.breadTypesQty[i].quantity = 0 ;
        }
    }

    // Checks to see if all required values are present 
    if (orderValues.orderName != "" && orderValues.orderDate != "") {
        
        try {
            const orderForSave = new order(orderValues);
            await orderForSave.save();
            win.webContents.send("add-order-status", "ok");
            update()
        } catch (error) {
            console.log(error);
        }
    }else if (orderValues.orderName == "" && orderValues.orderDate == "" ) {
        win.webContents.send("add-order-status", "no-name-and-no-date");

    }else if (orderValues.orderName == "" ) {
        win.webContents.send("add-order-status", "no-name");

    }else if (orderValues.orderDate == "" ) {
        win.webContents.send("add-order-status", "no-date");
    }
}

// Builds array of order details and sends it to the renderer proccess 
function sendSearchResults(orderSearchResults){
    let orderSearchResultsForSend = [];
        breadTypesQty = [];
        //builds and ipcrender send compatible array from query results
        for (let i = 0; i < orderSearchResults.length; i++) {
            breadTypesQty = [];
            const id = (orderSearchResults[i]._id).toString();
            const orderDate = orderSearchResults[i].orderDate;
            const orderName = orderSearchResults[i].orderName;
            const breadTypesQtyFetched = orderSearchResults[i].breadTypesQty;
            const orderComments = orderSearchResults[i].orderComments;
            const paid = orderSearchResults[i].paid;
            const standingOrder = orderSearchResults[i].standingOrder;
        
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





// Updates bread type in database when bread type is edited 
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

//Saves order to orders database
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
        update()
    } catch (error) {
        console.log(error);
    }
}

// Deletes specified order in database
async function handleDeleteOrder(event, orderValues) {
    try {
        await order.deleteOne({ _id: orderValues.id });
        win.webContents.send("request-order-search-results", "message");

    } catch (error) {
        console.log(error);
    }
}

// updates unpaid orders list 
async function updateUnpaidOrders() {
    try {
        const unpaidOrderValues = await order.find({ paid: false});
        let valuesForSend = [];
        
        for (let i = 0; i < unpaidOrderValues.length; i++ ) {
            let totalAmountDueRetail = 0;
            let totalAmountDueTrade = 0;

            for (let j = 0; j < unpaidOrderValues[i].breadTypesQty.length; j++) {
                totalAmountDueRetail = totalAmountDueRetail + (unpaidOrderValues[i].breadTypesQty[j].retailPrice * unpaidOrderValues[i].breadTypesQty[j].quantity);
                totalAmountDueTrade = totalAmountDueTrade + (unpaidOrderValues[i].breadTypesQty[j].tradePrice * unpaidOrderValues[i].breadTypesQty[j].quantity);
            }

            valuesForSend.push({ 
                orderName: unpaidOrderValues[i].orderName, 
                orderDate: unpaidOrderValues[i].orderDate,
                totalAmountDueRetail: totalAmountDueRetail,
                totalAmountDueTrade: totalAmountDueTrade, 
                paid: unpaidOrderValues[i].paid,
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

// Updates order to paid status 
async function handleUpdateOrderToPaid(event, id) {
    await order.updateOne({ _id: id }, { $set: { paid: true }});
    updateUnpaidOrders();
    update();
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



