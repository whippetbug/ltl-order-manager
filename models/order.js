const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderDate: {
        type: Date,
        required: true
    },
    orderName: {
        type: String,
        required: true,
    },
    breadTypesQty: {
        type: Array
    },

    paid: {
        type: Boolean
    },

    standingOrder: {
        type: Boolean
    },

    invoiceSent: {
        type: Boolean,
        default: false
    },

    orderComments: {
        type: String 
    },

    createdAt: {
        type: Date, 
        default: () => Date.now(), 
        immutable: true,
    },

})

module.exports = mongoose.model("Order", orderSchema);
