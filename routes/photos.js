'use strict';
var express = require('express');
var router = express.Router();
var debug = require('debug')('shared-images:routes');

//loads  lib files which interfaces with the database
var photoServices = require('../lib/photos');
var userServices = require('../lib/users');

//api to get photo. photo id is required
router.get('/get_photo/:photoId', function(req, res, next) {
  //calls the lib function to get the photo information
  var getPhotoPromise = photoServices.getPhoto(req.params.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(data) {
    var response = {status : 0, message :''};
    if (data) {
        response.status = 1;
        response.message = 'photo found';
        response.photo = data;
        return res.status(200).json(response);
    }
    else {
        response.status = 0;
        response.message = 'photo not found';
        return res.status(404).json(response);
    }
  }
  function getPhotoFailure(err) {
    next(err);
  }  
});

//api to get all the photos.
router.get('/get_photos', function(req, res, next) {
  //calls the lib function to get all the photos.
  var getPhotosPromise = photoServices.getPhotos();
  getPhotosPromise.then(getPhotosSuccess, getPhotosFailure);  
  function getPhotosSuccess(data) {
    debug('route get_photo getPhotosSuccess');
    var response = {status : 0, message :''};
    if (data) {
        response.status = 1;
        debug(data.length);
        response.message = data.length? 'photos listed' : 'no photos to list';
        response.photo = data;
        return res.status(200).json(response);
    }
    else {
        response.status = 0;
        response.message = 'photo not found';
        return res.status(404).json(response);
    }
  }
  function getPhotosFailure(err) {
    next(err);
  }  
});

//api to add a photo. email (owner user) and image url are required.
router.post('/add_photo', function(req, res, next) {
  if (!req.body.email || !req.body.url) {
    return res.status(400).send('both user email and photo url should be provided');
  }      
  //first fetches the user - uses the library function getUser1 - which returns stripped user info.
  var getUserPromise = userServices.getUser1(req.body.email);
  getUserPromise.then(getUserSuccess, getUserFailure);
  function getUserSuccess(user) {
    var response = {status : 0, message :''};
    if (!user) {
        response.status = 0;
        response.message = 'User not found';
        return res.status(404).json(response);
    }
    else {
      //calls the lib function to add the photo
      var addPhotoPromise = photoServices.addPhoto(user, req.body);
      addPhotoPromise.then(addPhotoSuccess, addPhotoFailure);
      function addPhotoSuccess(data) {
        var response = {status : 1, message :'Photo added successfully'};
        return res.status(200).json(response);
      }
      function addPhotoFailure(err) {
        next(err);
      }  
    }
  }
  function getUserFailure(err) {
    next(err);
  }    
});

//api to share a photo with another user. 
//photo id and email(of the user with whom the photo to be shared) are required
router.post('/share_photo', function(req, res, next) {
  if (!req.body.email || !req.body.photoId) {
    return res.status(400).send('both user email and photo id should be provided');
  } 
  //calls the lib function to fetch the photo info
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route share_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
        //photo not found. send the status
        response.status = 0;
        response.message = 'photo not found';
        return res.status(404).json(response);
    }
    else {
        //photo found. check user is available. if available share the photo with the user
        checkUserAndSharePhoto(photo);
    }
  }
  function getPhotoFailure(data) {
    next('Database error');
  }

  //an utility function
  function checkUserAndSharePhoto(photo) {
    //fetches the user - uses the library function getUser1 - which returns stripped user info.
    var getUserPromise = userServices.getUser1(req.body.email);
    getUserPromise.then(getUserSuccess, getUserFailure);
    function getUserSuccess(user) {
      var response = {status : 0, message :''};
      if (!user) {
          //user not found. send the status
          response.status = 0;
          response.message = 'User not found';
          return res.status(404).json(response);
      }
      else {
        //user found. calls the lib function to share the photo.
        var sharePhotoPromise = photoServices.sharePhoto(photo, user);
        sharePhotoPromise.then(sharePhotoSuccess, sharePhotoFailure);
        function sharePhotoSuccess(data) {
          debug('sharePhotoSuccess : ', data);
          var response = {status : 1, message :'Photo shareed successfully'};
          return res.status(200).json(response);
        }
        function sharePhotoFailure(err) {
          next(err);
        }  
      }
    }
    function getUserFailure(err) {
      next(err);
    }        
  } 
  function getUserFailure(err) {
    next(err);
  }    
});


//api to unsahre the photo.
//photo id and email(of the user with whom the photo to be unshared) are required
router.post('/unshare_photo', function(req, res, next) {
  if (!req.body.email || !req.body.photoId) {
    return res.status(400).send('both user email and photo id should be provided');
  }          
  //calls the lib function to fetch the photo info
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route unshare_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
        //photo not found. send the status
        response.status = 0;
        response.message = 'photo not found';
        return res.status(404).json(response);
    }
    else {
        //photo found. check user is available. if available unshare the photo with the user
        checkUserAndUnsharePhoto(photo);
    }
  }
  function getPhotoFailure(data) {
    next('Database error');
  }
  //an utility function
  function checkUserAndUnsharePhoto(photo) {
    //fetches the user - uses the library function getUser1 - which returns stripped user info.
    var getUserPromise = userServices.getUser1(req.body.email);
    getUserPromise.then(getUserSuccess, getUserFailure);
    function getUserSuccess(user) {
      debug('route unshare_photo getUserSuccess');
      var response = {status : 0, message :''};
      if (!user) {
          //user not found. send the status
          response.status = 0;
          response.message = 'User not found';
          return res.status(404).json(response);
      }
      else {
        //user found. calls the lib function to unshare the photo.
        var unsharePhotoPromise = photoServices.unsharePhoto(photo, user);
        unsharePhotoPromise.then(unsharePhotoSuccess, unsharePhotoFailure);
        function unsharePhotoSuccess(data) {
          debug('unsharePhotoSuccess', data);
          var response = {status : 1, message :'Photo unshared successfully'};
          return res.status(200).json(response);
        }
        function unsharePhotoFailure(err) {
          next(err);
        }  
      }
    }
    function getUserFailure(err) {
      next(err);
    }        
  } 
  function getUserFailure(err) {
    next(err);
  }    
});

//api to delete a photo. photo id is required.
router.post('/delete_photo', function(req, res, next) {
  if (!req.body.photoId) {
    return res.status(400).send('photo id not provided');
  }
  //calls the lib function to fetch photo.            
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route unshare_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
      //photo not found. send the status
      response.status = 0;
      response.message = 'photo not found';
      return res.status(404).json(response);
    }
    else {
      //photo found. call the lib function to delete the photo.
      var deletePhotoPromise = photoServices.deletePhoto(photo);
      deletePhotoPromise.then(deletePhotoSuccess, deletePhotoFailure);  
      function deletePhotoSuccess(data) {
          var response = {status : 1, message :'Photo deleted successfully'};
          return res.status(200).json(response);
        }
        function deletePhotoFailure(err) {
          next(err);
        }  
    }
  }
  function getPhotoFailure(err) {
    next(err);
  }
});

//api to update photo information. photo id is required. 
router.post('/update_photo', function(req, res, next) {
  if (!req.body.photoId) {
    return res.status(400).send('photoId is not provided');
  }
  //call the lib function to fetch photo info.
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route unshare_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
      //photo not found. send the status
      response.status = 0;
      response.message = 'photo not found';
      return res.status(404).json(response);
    }
    else {
      //photo found. call the lib function to update photo.
      var updatePhotoPromise = photoServices.updatePhoto(photo, req.body);
      updatePhotoPromise.then(updatePhotoSuccess, updatePhotoFailure);  
      function updatePhotoSuccess(data) {
          debug('updatePhotoSuccess', data);
          var response = {status : 1, message :'Photo updated successfully'};
          return res.status(200).json(response);
        }
        function updatePhotoFailure(err) {
          next(err);
        }  
    }
  }
  function getPhotoFailure(err) {
    next(err);
  }
});

module.exports = router;
