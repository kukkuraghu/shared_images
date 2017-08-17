'use strict';
var debug = require('debug')('shared-images:users');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Photo = mongoose.model('Photo');
exports.getUser = getUser;
exports.getUser1 = getUser1;
exports.getUsers = getUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;

//lib function to fetch user using email. populates the photos loaded by the user.
function getUser(email) {
    debug('lib users.js getUser email :' +  email);
    return User.findOne({email : email}).populate('photos').exec();
}

//lib function to fetch user using email. Does not populate the photos loaded by the user.
function getUser1(email, callback) {
    debug('lib users.js getUser1 email :' +  email);
    return User.findOne({email : email}).exec();
}

//lib function to list all the users
function getUsers() {
    debug('lib users.js getUsers');
    return User.find(null).populate('photos').exec();
}

//lib function to add an user
function addUser(userInfo) {
    return User.create({firstName : userInfo.firstName, lastName : userInfo.lastName, email : userInfo.email, shortName : userInfo.shortName});
}

//lib function to update an user
function updateUser(user, updateInfo) {
    user.firstName = updateInfo.firstName || user.firstName;
    user.lastName = updateInfo.lastName || user.lastName;
    user.shortName = updateInfo.shortName || user.shortName;
    user.avatar = updateInfo.avatar || user.avatar;
    return user.save();
}

//lib function to delete an user
function deleteUser(user) {
    return Photo.remove({_creator : user}).exec().then(
        () => User.remove({email : user.email}).exec()
    );
}
