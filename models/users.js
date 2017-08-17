'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    firstName   : {type : String, required : true},
    lastName    : {type : String, required : true},
    email       : {type : String, required : true, unique: true},
    shortName   : String,
    avatar      : String,
    photos      : [{type: Schema.Types.ObjectId, ref: 'Photo'}]         
});
module.exports = mongoose.model('User', UserSchema);