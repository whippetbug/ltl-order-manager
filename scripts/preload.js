const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveBreadType: (breadType) =>  ipcRenderer.send("save-bread-type", breadType),
    updateBreadList: (callback) => ipcRenderer.on("update-bread-list", callback ),
    deleteBreadType: (breadType) => ipcRenderer.send("delete-bread-type", breadType),
    addOrder: (orderValues) => ipcRenderer.send("add-order", orderValues),
    searchOrdersDate: (date) => ipcRenderer.send("search-orders-date", date),
    searchOrdersName: (name) => ipcRenderer.send("search-orders-name", name),
    searchOrdersName1Date: (name, date) => ipcRenderer.send("search-orders-name-1-date", name, date),
    searchOrdersName2Dates:(name, startDate, endDate) => ipcRenderer.send("search-orders-name-2-dates", name, startDate, endDate),
    searchOrdersBetweenDates: (startDate, endDate) => ipcRenderer.send("search-orders-between-dates", startDate, endDate),
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
    saveCustomer: (customerName, tradePriceFormula) => ipcRenderer.send("save-customer", customerName, tradePriceFormula),
    addCustomerStatus: (status) => ipcRenderer.on("add-customer-status", status),
    fetchCustomerData: () => ipcRenderer.send("fetch-customer-data"),
    returnCustomerData: (customerData) => ipcRenderer.on("return-customer-data", customerData),
    deleteCustomer: (customerId) => ipcRenderer.send("delete-customer", customerId), 
    updateCustomer: (customerId, customerName, tradePriceFormula) => {
        ipcRenderer.send("update-customer", customerId, customerName, tradePriceFormula )
    },
    openOrderDetails: (orderDetails) => ipcRenderer.send("open-order-details", orderDetails),
});