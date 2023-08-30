const {app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mongoose = require("mongoose");
const breadTypes = require("./models/bread-types");
const order = require("./models/order");

var fetchBreadTypes, sendOrderSearchResults, win, breadTypesQty;


//Creates new root window
const createWindow = () => {
    win = new BrowserWindow({
        width: 1000,
        height: 650,
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
                let name = fetchedBreadTypes[i].name;
                let retailPrice = fetchedBreadTypes[i].retailPrice;
                let tradePrice = fetchedBreadTypes[i].tradePrice;

                breadTypesForList.splice( i, 0, { name: name, tradePrice: tradePrice, retailPrice: retailPrice});
            }
            //Sends ipc message and array to reneder process
            win.webContents.send("update-bread-list", breadTypesForList);

        } catch (error) {
            console.log(error);
        }
    
    }

    //sends order search results to render process
    sendOrderSearchResults =  (orderSearchResults) => {
        win.webContents.send("update-order-search-results", orderSearchResults);
    }

    //Connects to mongoose 
    const mongooseConnect = async () => {
        try {
            await mongoose.connect("mongodb://localhost/ltlordersdb");
            await fetchBreadTypes();
            console.log("Mongoose connection established");
        } catch (error) {
            console.log(error);
        }
    }
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
async function handleDeleteBreadType (event, breadType){
    try {
        await breadTypes.deleteOne({ name:breadType });
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

//Searches orders in database
async function handleSearchOrders (event, date) {
    try {
        const orderSearchResults = await order.find({ orderDate: date});
        let orderSearchResultsForSend = [];
        breadTypesQty = [];
        //builds and ipcrender send compatible array from query results
        for (let i = 0; i < orderSearchResults.length; i++) {
            breadTypesQty = [];
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
                });
            }

            orderSearchResultsForSend.splice(i, 0, { 
                orderDate: orderDate, 
                orderName: orderName, 
                breadTypesQty: breadTypesQty,
                orderComments: orderComments,
                paid: paid,
                standingOrder: standingOrder,
            });
        }
        sendOrderSearchResults(orderSearchResultsForSend);
    } catch (error) {
        console.log(error);
    }
}

// Updates bread type in database when bread type is edited 
async function handleUpdateBreadType(event, updatedBreadTypeValues) {
    await breadTypes.updateOne({
        name: updatedBreadTypeValues.originalName
    },
    { $set: 
        {
            name: updatedBreadTypeValues.name,
            tradePrice: updatedBreadTypeValues.tradePrice,
            retailPrice: updatedBreadTypeValues.retailPrice,
        }
    });
    fetchBreadTypes();
}

app.whenReady().then(() => {
    ipcMain.on("save-bread-type", handleSaveBreadType);
    ipcMain.on("delete-bread-type", handleDeleteBreadType);
    ipcMain.on("add-order", handleAddOrder);
    ipcMain.on("search-orders", handleSearchOrders);
    ipcMain.on("update-bread-type", handleUpdateBreadType);
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



