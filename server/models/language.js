var mongoose = require("mongoose");

var languageSchema = new mongoose.Schema({
    name: String,
    user: String,
    period: {
        current: {type: Number, default: 0},
        length: {type: Number, default: 9}
    },
    session: {
        last: {type: Object, default: []},
        date: Date
    },
	dictionary: [{
        ref: {type: Boolean, default: true},
        fields: [],
        count: {
            correct: {type: Number, default: 0},
            wrong: {type: Number, default: 0}
        },
        countdown: {
            new: {type: Number, default: 5},
            wrong: {type: Number, default: 0}
        }
    }],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model("language", languageSchema);