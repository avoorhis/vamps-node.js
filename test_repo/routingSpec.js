// routingSpec.js
// test routing

var async = require('async'),
  request = require('supertest'),
  should  = require('should'),
  superagent  = require('superagent'),
  app     = require('../app');

describe('express rest api server', function() {
  var id;

  // it('post object', function(done){
  //   superagent.post('http://localhost:3000')
  //     .send({ name: 'John', email: 'john@rpjs.co'})
  //     .end(function(e,res){
  //       //console.log(res.body)
  //       app(res.body.length).to.eql(1)
  //       app(res.body[0]._id.length).to.eql(24)
  //       id = res.body[0]._id
  //       done()
  //     })
  // })

  // it('retrieves an object', function(done){
  //   superagent.get('http://localhost:3000/collections/test/'+id)
  //     .end(function(e, res){
  //       // console.log(res.body)
  //       app(e).to.eql(null)
  //       app(typeof res.body).to.eql('object')
  //       app(res.body._id.length).to.eql(24)
  //       app(res.body._id).to.eql(id)
  //       done()
  //     })
  // })

  // it('retrieves a collection', function(done){
  //   superagent.get('http://localhost:3000/collections/test')
  //     .end(function(e, res){
  //       // console.log(res.body)
  //       app(e).to.eql(null)
  //       app(res.body.length).to.be.above(0)
  //       app(res.body.map(function (item){return item._id})).to.contain(id)
  //       done()
  //     })
  // })

  // it('updates an object', function(done){
  //   superagent.put('http://localhost:3000/collections/test/'+id)
  //     .send({name: 'Peter'
  //       , email: 'peter@yahoo.com'})
  //     .end(function(e, res){
  //       // console.log(res.body)
  //       app(e).to.eql(null)
  //       app(typeof res.body).to.eql('object')
  //       app(res.body.msg).to.eql('success')
  //       done()
  //     })
  // })
  // it('checks an updated object', function(done){
  //   superagent.get('http://localhost:3000/collections/test/'+id)
  //     .end(function(e, res){
  //       // console.log(res.body)
  //       app(e).to.eql(null)
  //       app(typeof res.body).to.eql('object')
  //       app(res.body._id.length).to.eql(24)
  //       app(res.body._id).to.eql(id)
  //       app(res.body.name).to.eql('Peter')
  //       done()
  //     })
  // })

  // it('removes an object', function(done){
  //   superagent.del('http://localhost:3000/collections/test/'+id)
  //     .end(function(e, res){
  //       // console.log(res.body)
  //       app(e).to.eql(null)
  //       app(typeof res.body).to.eql('object')
  //       app(res.body.msg).to.eql('success')
  //       done()
  //     })
  // })
});
