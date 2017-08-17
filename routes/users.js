'use strict';
var express = require('express');
var router = express.Router();
var debug = require('debug')('shared-images:routes');
var usersServices = require('../lib/users');

router.get('/get_user/:email', function(req, res, next) {
  var getUserPromise = usersServices.getUser(req.params.email);
  getUserPromise.then(getUserSuccess, getUserFailure);  
  function getUserSuccess(data) {
    debug('route get_user getUserSuccess');
    var response = {status : 0, message :''};
    if (data) {
        response.status = 1;
        response.message = 'User found';
        response.user = data;
        return res.status(200).json(response);
    }
    else {
        response.status = 0;
        response.message = 'User not found';
        return res.status(404).json(response);
    }
  }
  function getUserFailure(err) {
    next(err);
  }  
});

router.get('/get_users', function(req, res, next) {
  var getUsersPromise = usersServices.getUsers();
  getUsersPromise.then(getUsersSuccess, getUsersFailure);  
  function getUsersSuccess(data) {
    debug('route get_user getUsersSuccess');
    var response = {status : 0, message :''};
    response.status = 1;
    response.message = data.length? 'users listed' : 'no users to list';
    response.users = data;
    return res.status(200).json(response);
  }
  function getUsersFailure(err) {
    next(err);
  }  
});

router.post('/add_user', function(req, res, next) {
  if (!req.body.email) {
    return res.status(400).send('email not provided');
  }  
  var addUserPromise = usersServices.addUser(req.body);
  addUserPromise.then(addUserSuccess, addUserFailure);
  function addUserSuccess(data) {
    var response = {status : 1, message :'user added successfully'};
    return res.status(200).json(response);
  }
  function addUserFailure(err) {
    next(err);
  }
});
router.post('/delete_user', function(req, res, next) {
  if (!req.body.email) {
    return res.status(400).send('email not provided');
  }    
  var getUserPromise = usersServices.getUser1(req.body.email);
  getUserPromise.then(getUserSuccess, getUserFailure);
  function getUserSuccess(user) {
    debug('route delete_user getUserSuccess');
    var response = {status : 0, message :''};
    if (!user) {
        response.status = 0;
        response.message = 'User not found';
        return res.status(404).json(response);
    }
    else {
      var deleteUserPromise = usersServices.deleteUser(user);
      deleteUserPromise.then(deleteUserSuccess, deleteUserFailure);
      function deleteUserSuccess(data) {
        var response = {status : 1, message :'user deleted successfully'};
        return res.status(200).json(response);
      }
      function deleteUserFailure(err) {
        next(err);
      }      
    }
  }
  function getUserFailure(err) {
    next(err);
  }
});    
router.post('/update_user', function(req, res, next) {
  if (!req.body.email) {
    return res.status(400).send('email not provided');
  }    
  var getUserPromise = usersServices.getUser1(req.body.email);
  getUserPromise.then(getUserSuccess, getUserFailure);
  function getUserSuccess(user) {
    var response = {status : 0, message :''};
    if (!user) {
        response.status = 0;
        response.message = 'User not found';
        return res.status(404).json(response);
    }
    else {
      var updateUserPromise = usersServices.updateUser(user, req.body);
      updateUserPromise.then(updateUserSuccess, updateUserFailure);
      function updateUserSuccess(data) {
        var response = {status : 1, message :'User updated successfully'};
        return res.status(200).json(response);
      }
      function updateUserFailure(data) {
        console.log(data);
        next('update user failed');
      }      
    }
  }
  function getUserFailure(data) {
    next('Database error');
  }    
});
module.exports = router;
