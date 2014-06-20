var express = require('express');
var router = express.Router();

// route middleware to make sure a user is logged in


function get_user(req){
    if(!req.user || req.user==undefined)
        return ''
    return req.user         
}
module.exports = isLoggedIn;