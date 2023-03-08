const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true, minLength: 1},
    password: {type: String, required: true, minLength: 1},
    user_lower: {type: String, required: true, minLength: 1}
});

module.exports = mongoose.model("User", userSchema);