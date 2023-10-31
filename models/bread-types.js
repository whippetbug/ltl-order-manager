const mongoose = require("mongoose");

const breadTypeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    retailPrice: {
        type: Number,
    },
})

module.exports = mongoose.model("breadTypes", breadTypeSchema);