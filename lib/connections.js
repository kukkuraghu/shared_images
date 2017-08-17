var debug = require('debug')('ccpairing:connections');
var mongoose = require('mongoose'); 

//load the mongoURI from config/config.json
var config = require( './../config' );
if (!config.mongoURI) {
    config.mongoURI = "mongodb://localhost:27017/testDb";
}

// Database connect options
var options = { replset: { socketOptions: { connectTimeoutMS : 30000 }}};
mongoose.connect(config.mongoURI, options);
mongoose.connection.on('connected', function () {console.log('MongoDB connected')}); 
mongoose.connection.on('error',     function()  {console.log('MongoDB connection error')});
mongoose.connection.on('close',     function()  {console.log('MongoDB connection closed')});
// Close the Mongoose connection on Control+C 
process.on('SIGINT', function() {  
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected');    
        process.exit(0);  
    }); 
});

//register the schemas
require('../models/users'); 
require('../models/photos');
