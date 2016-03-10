'use strict'
require('dotenv').config()
const Hapi = require('hapi')
const mongo = require('mongodb').MongoClient
const Bing = require('node-bing-api')({ accKey: "KtHX2UkyZfwZzjeQB5z2M39nhPFmXebbBqklFk42xYE" });

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
const uri = process.env.URI

const server = new Hapi.Server()
server.connection({
  // required for Heroku
  port: process.env.PORT || 8080
})

server.register(require('inert'), (err) => {
  if (err) throw err

  server.route({
    method: 'GET',
    path: '/api/imagesearch/{term}',
    handler: function(request, reply) {
      const term = request.params.term
      const offset = request.query.offset || 0
      
      Bing.images(term, {
        top: 10, // Number of results (max 15 for news, max 50 if other) 
        skip: offset // Skip first x results 
      }, function(err, res, body) {
        if (err) throw err
        saveSearch(term)
        const results = body.d.results
        let mapped = results.map((result) => {
          return {url: result.MediaUrl, snippet: result.Title, thumbnail: result.Thumbnail.MediaUrl, context: result.SourceUrl}
        })
        reply(mapped)
      });
    }
  })

  server.route({
    method: 'GET',
    path: '/api/latest/imagesearch',
    handler: function(request, reply) {
      getLatest(reply)
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      reply.file('index.html')
    }
  })

})

server.start(() => console.log('starting'))

function saveSearch(term){
  mongo.connect(uri, function(err, db){
    if (err) throw err
    const searches = db.collection('searches')
    searches.insert({
      term: term,
      when: new Date()
    }, function(err, result){
      if (err) throw err
    })
  })
}

function getLatest(reply){
  mongo.connect(uri, function(err, db){
    if (err) throw err
    const searches = db.collection('searches')
    searches.find({}, {_id:0}).sort({when: -1}).limit(10).toArray(function(err, result){
      if (err) throw err
      reply(result)
    })
  })
}