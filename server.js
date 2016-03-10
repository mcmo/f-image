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
      }, function(error, res, body) {
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
      reply('you requested latest searches')
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