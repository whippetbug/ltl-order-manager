const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orderDetailsAPI", {
    orderDetails: (orderDetails) => ipcRenderer.on("order-details", orderDetails),
    fetchDetails: (message) => ipcRenderer.send("fetch-details", message),
});