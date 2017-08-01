var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    languages: [{
        name: String
    }],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model("user", userSchema);