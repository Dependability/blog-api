const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: {ref: "User", type: Schema.Types.ObjectId, required: true},
    title: {type: String, required: true, minLength: 1},
    body: {type: String, required: true, minLength: 1},


});

module.exports = mongoose.model("Post", PostSchema)