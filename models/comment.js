const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: {ref: "User", type: Schema.Types.ObjectId, required: true},
    body: {type: String, required: true, minLength: 1},
    time: Date,
    post: {ref: "Post", type: Schema.Types.ObjectId, required: true}

});

module.exports = mongoose.model('Comment', CommentSchema)