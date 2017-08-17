'use strict';
var debug = require('debug')('shared-images:photos');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Photo = mongoose.model('Photo');
exports.getPhoto = getPhoto;
exports.getPhotos = getPhotos;
exports.addPhoto = addPhoto;
exports.sharePhoto = sharePhoto;
exports.unsharePhoto = unsharePhoto;
exports.deletePhoto = deletePhoto;
exports.updatePhoto = updatePhoto;

function getPhoto(photoId) {
    debug('lib photos.js getPhoto photoId :' +  photoId);
    return Photo.findOne({_id : photoId}).populate(['_creator', 'sharedWith']).exec();
}

function getPhotos() {
    debug('lib photos.js getPhotos:');
    return Photo.find(null).populate(['_creator', 'sharedWith']).exec();
}

function addPhoto(user, photoInfo) {
    return Photo.create({_creator : user._id, url : photoInfo.url, name : photoInfo.name, created : photoInfo.created}).then(
            (photo) => {
                user.photos.push(photo);
                return user.save();
            }
    );
}

function sharePhoto(photo, user) {
    var sharePhotoPromise = new Promise((resolve, reject) => {
        let index = photo.sharedWith.findIndex(sharedWith => sharedWith._id.equals(user._id));
        if (index !== -1) return resolve('photo already shared with the user');
        photo.sharedWith.push(user);
        photo.save().then(
            () => resolve('photo shared')
        ).
        catch((error) => reject('error in sharing photo ' + error));
    });
    return sharePhotoPromise;
}

function unsharePhoto(photo, user) {
    var unsharePhotoPromise = new Promise((resolve, reject) => {
        debug(photo.sharedWith);
        let index = photo.sharedWith.findIndex(sharedWith => sharedWith._id.equals(user._id));
        if (index !== -1) {
            photo.sharedWith.splice(index, 1);
            photo.save().then(
                () => resolve('photo shared')
            ).
            catch((error) => reject('error in sharing photo ' + error));
        }
        else {
            resolve('photo was not shared with the user');
        }
    });
    return unsharePhotoPromise;
}

function deletePhoto(photo) {
    let creator = photo._creator;
    let index = creator.photos.findIndex(photoId => photoId.equals(photo._id));
    if (index !== -1)  {
        creator.photos.splice(index, 1);
        return creator.save().then(
            () =>   Photo.remove({_id: photo._id}).exec()
        )
    }
    else {
        return Photo.remove({_id: photo._id}).exec();
    }
}

function updatePhoto(photo, updateInfo) {
    photo.url       = updateInfo.url    || photo.url;
    photo.name      = updateInfo.name   || photo.name;
    photo.created   = updateInfo.date   || photo.date;
    return photo.save();
}