const { mainWindow } = require("../main.js");
const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
var orderDetailsWin, orderDetailsForSend;

const createOrderDetailsWin = () => { 
    orderDetailsWin = new BrowserWindow({
        parent: mainWindow,
        width: 900,
        height: 600,
        icon:  "icons/icon.png",
        webPreferences: {
            preload: path.join(__dirname, "order-details-preload.js"),
        }
    })
    orderDetailsWin.loadFile("layouts/order-details.html");
};

function handleFetchDetails(){
    orderDetailsWin.webContents.send("order-details", orderDetailsForSend);
}

const openOrderDetails = (orderDetails) => {
    orderDetailsForSend = orderDetails;
    console.log(orderDetails)
    ipcMain.on("fetch-details", handleFetchDetails);
    createOrderDetailsWin();
}

module.exports = { openOrderDetails }





