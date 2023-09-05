const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveBreadType: (breadType) =>  ipcRenderer.send("save-bread-type", breadType),
    updateBreadList: (callback) => ipcRenderer.on("update-bread-list", callback ),
    deleteBreadType: (breadType) => ipcRenderer.send("delete-bread-type", breadType),
    addOrder: (orderValues) => ipcRenderer.send("add-order", orderValues),
    searchOrders: (date) => ipcRenderer.send("search-orders", date),
    returnOrderResults: (callback) => ipcRenderer.on("update-order-search-results", callback),
    addOrderSatus: (status) => ipcRenderer.on("add-order-status", status),
    updateBreadType: (updatedBreadTypeValues) => ipcRenderer.send("update-bread-type", updatedBreadTypeValues),
    editOrder: (editedValues) => ipcRenderer.send("save-edited-order", editedValues),
    updateOrderSearchResults: (message) => ipcRenderer.on("update-order-search-results"),
    deleteOrder: (orderValues) => ipcRenderer.send("delete-order", orderValues),
});