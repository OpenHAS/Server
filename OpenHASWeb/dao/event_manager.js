var mongoose = require('mongoose')
var Event = require('./models/event').Model
var Node = require('./models/node').Model
var winston = require('winston')
var NodeManager = require('./node_manager')


var EventManager = function(){}

EventManager.prototype.parseEvent = function(eventAsString) {

  var elements = eventAsString.split(',')
  var newEvent = null
  if (elements.length >= 3) {
    newEvent = new Event()
    newEvent.source = elements[0] + ':' + elements[1]
    newEvent.timestamp = new Date()

    for (var i = 2; i < elements.length; i++) {
      var current = elements[i];
      newEvent.parameters.push(current)
    }
  } else {
    winston.error('Unknown event, cannot parse: %s', eventAsString)
  }

  return newEvent

}

EventManager.prototype.saveEvent = function(event, callback) {

  //save the event under each node
  // Node.find({address : event.source}, function (error, nodes) {
  //   for (var index = 0; index < nodes.length; index++) {
  //     var currentNode = nodes[index]
  //
  //     currentNode.events.push(event)
  //     currentNode.save(function(error, savedNode) {
  //       if (error) {
  //         winston.error('Error saving an event to its parent node:', error)
  //       }
  //     })
  //   }
  // })

  //but also save it to the event store
  event.save(function(error,savedEvent){
    if (error) {
      winston.error('Error saving event to the event store:', error)
      if (callback)
        callback(false)
    } else {

      if (callback)
        callback(true)
    }
  })

}

module.exports = EventManager