const mongoose = require("mongoose");

const breadTypeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    tradePrice: {
        type: Number,

    },
    retailPrice: {
        type: Number,
    },
})

module.exports = mongoose.model("breadTypes", breadTypeSchema);