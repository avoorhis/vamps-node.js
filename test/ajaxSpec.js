// force the test environment to 'test'
process.env.NODE_ENV = 'testing'
var async = require('async'),
    sinon = require('sinon'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app')
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');

// https://www.airpair.com/javascript/posts/unit-testing-ajax-requests-with-mocha
var myapi = {
    get: function(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://jsonplaceholder.typicode.com/posts/1', true);

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    callback(null, JSON.parse(xhr.responseText));
                }
                else {
                    callback(xhr.status);
                }
            }
        };

        xhr.send();
    },

    post: function(data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://jsonplaceholder.typicode.com/posts', true);

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                callback();
            }
        };

        xhr.send(JSON.stringify(data));
    }
};


describe('MyAPI', function() {
    beforeEach(function() {
        this.xhr = sinon.useFakeXMLHttpRequest();

        this.requests = [];
        this.xhr.onCreate = function(xhr) {
            this.requests.push(xhr);
        }.bind(this);
    });

    afterEach(function() {
        this.xhr.restore();
    });


    // it('should parse fetched data as JSON', function(done) {
    //     var data = { foo: 'bar' };
    //     var dataJson = JSON.stringify(data);

    //     myapi.get(function(err, result) {
    //         result.should.deep.equal(data);
    //         done();
    //     });

    //     this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    // });
});