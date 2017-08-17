'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PhotoSchema = new Schema({
    _creator    : {type: Schema.Types.ObjectId, ref: 'User' },
    url         : {type : String, required : true},
    name        : String,
    created     : Date,
    sharedWith  : [{type: Schema.Types.ObjectId, ref: 'User' }]
});
module.exports = mongoose.model('Photo', PhotoSchema);