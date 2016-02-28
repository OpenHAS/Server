var mqtt =  require('mqtt')
var config = require('../config')
var winston = require('winston')
var EventManager = require('../dao/event_manager')

var statusUpdateTopic = '/Status/generic'

var MessageProcessor = function(){
  this.client = mqtt.connect(config.mqtt.host,{username:config.mqtt.username,password:config.mqtt.password})
  this.eventManager = new EventManager()

  var self = this
  this.client.on('connect', function () {
    winston.info('Connected to MQTT broker: %s', config.mqtt.host)
    self.client.subscribe(config.mqtt.rootTopic+statusUpdateTopic);
  });

  this.client.on('message', this.processMessage);
}

MessageProcessor.prototype.processStatusMessage = function(message) {
  var parsedEvent = this.eventManager.parseEvent(message.toString())
  if (parsedEvent) {
    this.eventManager.saveEvent(parsedEvent)
  }

}

MessageProcessor.prototype.processMessage = function(topic, message) {
  winston.info('Message: %s Topic: %s',message.toString(), topic)

  if (topic.endsWith(statusUpdateTopic)) {
    MessageProcessor.prototype.processStatusMessage.call(module.exports,message)
  }
}


module.exports = new MessageProcessor()