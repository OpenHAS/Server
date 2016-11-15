var mongoose = require('mongoose')
var Event = require('./models/event').Model
var Node = require('./models/node').Model
var winston = require('winston')
var NodeManager = require('./node_manager')


var EventManager = function(){}

EventManager.prototype.parseMQTTEvent = function(eventAsString) {

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

EventManager.prototype.parseParticleEvent = function (particleEventObject) {

  var newEvent = null
  //we are only able to process temperature events at this point. Its a terrible solution, I know
  if (particleEventObject.name == "Temperature") {
    newEvent = new Event()
    newEvent.source = 'PARTICLE:' + particleEventObject.coreid
    newEvent.timestamp = new Date()
    var dataElements = particleEventObject.data.split(':')
    newEvent.parameters.push(dataElements[0]) // temp sensor address
    newEvent.parameters.push(dataElements[1]) // measured temperature
  }
  return newEvent
}

EventManager.prototype.saveEvent = function(event, callback) {

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