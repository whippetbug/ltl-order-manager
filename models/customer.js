const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    tradePriceFormula: {
        type: Number,
    },
});

module.exports = mongoose.model("customer", customerSchema);