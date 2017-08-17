'use strict';
var express = require('express');
var router = express.Router();
var debug = require('debug')('shared-images:routes');

//loads a lib files which interfaces with the database
var usersServices = require('../lib/users');

//api returns the user matching the email
router.get('/get_user/:email', function(req, res, next) {
  //call the lib function to fetch user
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

//api lists all the users
router.get('/get_users', function(req, res, next) {
  //call the lib function to get all the users
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

//api to add an user. user email is required.
router.post('/add_user', function(req, res, next) {
  if (!req.body.email) {
    return res.status(400).send('email not provided');
  }  
  //call the lib function to add the user
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

//api to delete an user. user email is required. 
//all the photos added by the user will also be deleted
router.post('/delete_user', function(req, res, next) {
  if (!req.body.email) {
    return res.status(400).send('email not provided');
  }
  //first fetches the user - uses the library function getUser1 - which returns stripped user info.    
  var getUserPromise = usersServices.getUser1(req.body.email);
  getUserPromise.then(getUserSuccess, getUserFailure);
  function getUserSuccess(user) {
    debug('route delete_user getUserSuccess');
    var response = {status : 0, message :''};
    if (!user) {
        //user not found. send the staus
        response.status = 0;
        response.message = 'User not found';
        return res.status(404).json(response);
    }
    else {
      //user found
      //call the library function to delete user
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

//api to update the user. user email should be provided.
router.post('/update_user', function(req, res, next) {
  if (!req.body.email) {
    return res.status(400).send('email not provided');
  }
  //first fetches the user - uses the library function getUser1 - which returns stripped user info.   
  var getUserPromise = usersServices.getUser1(req.body.email);
  getUserPromise.then(getUserSuccess, getUserFailure);
  function getUserSuccess(user) {
    var response = {status : 0, message :''};
    if (!user) {
        //user not found. send the status.
        response.status = 0;
        response.message = 'User not found';
        return res.status(404).json(response);
    }
    else {
      //user found
      //call the lib function to update user
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
