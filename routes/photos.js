'use strict';
var express = require('express');
var router = express.Router();
var debug = require('debug')('shared-images:routes');
var photoServices = require('../lib/photos');
var userServices = require('../lib/users');

router.get('/get_photo/:photoId', function(req, res, next) {
  var getPhotoPromise = photoServices.getPhoto(req.params.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(data) {
    debug('route get_photo getPhotoSuccess');
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

router.get('/get_photos', function(req, res, next) {
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
router.post('/add_photo', function(req, res, next) {
  if (!req.body.email || !req.body.url) {
    return res.status(400).send('both user email and photo url should be provided');
  }      
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

router.post('/share_photo', function(req, res, next) {
  if (!req.body.email || !req.body.photoId) {
    return res.status(400).send('both user email and photo id should be provided');
  }        
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route share_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
        response.status = 0;
        response.message = 'photo not found';
        return res.status(404).json(response);
    }
    else {
        checkUserAndSharePhoto(photo);
    }
  }
  function getPhotoFailure(data) {
    next('Database error');
  }
  function checkUserAndSharePhoto(photo) {
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

router.post('/unshare_photo', function(req, res, next) {
  if (!req.body.email || !req.body.photoId) {
    return res.status(400).send('both user email and photo id should be provided');
  }          
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route unshare_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
        response.status = 0;
        response.message = 'photo not found';
        return res.status(404).json(response);
    }
    else {
        checkUserAndUnsharePhoto(photo);
    }
  }
  function getPhotoFailure(data) {
    next('Database error');
  }
  function checkUserAndUnsharePhoto(photo) {
    var getUserPromise = userServices.getUser1(req.body.email);
    getUserPromise.then(getUserSuccess, getUserFailure);
    function getUserSuccess(user) {
      debug('route unshare_photo getUserSuccess');
      var response = {status : 0, message :''};
      if (!user) {
          response.status = 0;
          response.message = 'User not found';
          return res.status(404).json(response);
      }
      else {
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

router.post('/delete_photo', function(req, res, next) {
  if (!req.body.photoId) {
    return res.status(400).send('photo id not provided');
  }            
  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route unshare_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
      response.status = 0;
      response.message = 'photo not found';
      return res.status(404).json(response);
    }
    else {
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

router.post('/update_photo', function(req, res, next) {
  if (!req.body.photoId) {
    return res.status(400).send('photoId is not provided');
  }

  var getPhotoPromise = photoServices.getPhoto(req.body.photoId);
  getPhotoPromise.then(getPhotoSuccess, getPhotoFailure);  
  function getPhotoSuccess(photo) {
    debug('route unshare_photo getPhotoSuccess');
    var response = {status : 0, message :''};
    if (!photo) {
      response.status = 0;
      response.message = 'photo not found';
      return res.status(404).json(response);
    }
    else {
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
