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
    path: '/',
    handler: function(request, reply){
      reply('hapi is happy')
    }
  })
})

server.start(() => console.log('starting'))