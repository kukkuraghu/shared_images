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

//lib function to get photo information using photo id
function getPhoto(photoId) {
    debug('lib photos.js getPhoto photoId :' +  photoId);
    return Photo.findOne({_id : photoId}).populate(['_creator', 'sharedWith']).exec();
}

//lib function to list all the photos
function getPhotos() {
    debug('lib photos.js getPhotos:');
    return Photo.find(null).populate(['_creator', 'sharedWith']).exec();
}

//lib function which allows an user to add a photo
function addPhoto(user, photoInfo) {
    return Photo.create({_creator : user._id, url : photoInfo.url, name : photoInfo.name, created : photoInfo.created}).then(
            (photo) => {
                user.photos.push(photo);
                return user.save();
            }
    );
}

//lib function which shares a photo with another user
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

//lib function which unshares a photo with a user
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

//lib function to delete photo
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

//lib function to update photo
function updatePhoto(photo, updateInfo) {
    photo.url       = updateInfo.url    || photo.url;
    photo.name      = updateInfo.name   || photo.name;
    photo.created   = updateInfo.date   || photo.date;
    return photo.save();
}