'use strict';
var debug = require('debug')('shared-images:users');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Photo = mongoose.model('Photo');
exports.getUser = getUser;
exports.getUser1 = getUser1;
exports.getUsers = getUsers;
exports.addUser = addUser;
exports.addPhoto = addPhoto;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;

function getUser(email) {
    debug('lib users.js getUser email :' +  email);
    return User.findOne({email : email}).populate('photos').exec();
}

function getUser1(email, callback) {
    debug('lib users.js getUser1 email :' +  email);
    return User.findOne({email : email}).exec();
}

function getUsers() {
    debug('lib users.js getUsers');
    return User.find(null).populate('photos').exec();
}

function addUser(userInfo) {
    return User.create({firstName : userInfo.firstName, lastName : userInfo.lastName, email : userInfo.email, shortName : userInfo.shortName});
}

function updateUser(user, updateInfo) {
    user.firstName = updateInfo.firstName || user.firstName;
    user.lastName = updateInfo.lastName || user.lastName;
    user.shortName = updateInfo.shortName || user.shortName;
    user.avatar = updateInfo.avatar || user.avatar;
    return user.save();
}

function deleteUser(user) {
    return Photo.remove({_creator : user}).exec().then(
        () => User.remove({email : user.email}).exec()
    );
}

function addPhoto(email, url) {
    return getUser1(email).then(
        (user) =>  Photo.create({_creator : user._id, url : url}).then(
                        (photo) => {
                            user.photos.push(photo);
                            return user.save();
                        }
        )
    )
}