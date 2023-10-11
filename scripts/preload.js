const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveBreadType: (breadType) =>  ipcRenderer.send("save-bread-type", breadType),
    updateBreadList: (callback) => ipcRenderer.on("update-bread-list", callback ),
    deleteBreadType: (breadType) => ipcRenderer.send("delete-bread-type", breadType),
    addOrder: (orderValues) => ipcRenderer.send("add-order", orderValues),
    searchOrders: (date) => ipcRenderer.send("search-orders", date),
    returnOrderSearchResults: (callback) => ipcRenderer.on("update-order-search-results", callback),
    addOrderSatus: (status) => ipcRenderer.on("add-order-status", status),
    updateBreadType: (updatedBreadTypeValues) => ipcRenderer.send("update-bread-type", updatedBreadTypeValues),
    editOrder: (editedValues) => ipcRenderer.send("save-edited-order", editedValues),
    requestOrderSearchResults: (message) => ipcRenderer.on("request-order-search-results", message),
    updateOrderSearchResults: (values) => ipcRenderer.on("update-order-search-results", values),
    deleteOrder: (orderValues) => ipcRenderer.send("delete-order", orderValues),
    receiveUnpaidOrders: (values) => ipcRenderer.on("receive-unpaid-orders", values),
    updateUnpaidOrders: () => ipcRenderer.send("update-unpaid-orders"),
    mongooseConnectionEstablished: (connection) => ipcRenderer.on("mongoose-connection-established", connection),
    updateOrderToPaid: (id) => ipcRenderer.send("update-order-to-paid", id),
    update: (message) => ipcRenderer.on("update", message),
});