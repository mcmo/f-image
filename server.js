'use strict'
require('dotenv').config()
const Hapi = require('hapi')
const mongo = require('mongodb').MongoClient

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
    handler: function(request, reply){
      reply({
        term: request.params.term,
        when: ""
      })
    }
  })
  
  server.route({
    method: 'GET',
    path: '/api/latest/imagesearch',
    handler: function(request, reply){
      reply('you requested latest searches')
    }
  })
  
  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply){
      reply.file('index.html')
    }
  })
  
})

server.start(() => console.log('starting'))