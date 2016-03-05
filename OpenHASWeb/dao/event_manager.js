var mongoose = require('mongoose')
var Event = require('./models/event').Model
var winston = require('winston')

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

  event.save(function(error,savedEvent){
    if (error) {
      winston.error('Error saving event.', error)
      if (callback)
        callback(false)
    } else {
      winston.info('Event saved: %s', savedEvent._id.toString())
      if (callback)
        callback(true)
    }
  })

}

module.exports = EventManager