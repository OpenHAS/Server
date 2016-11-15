var mqtt =  require('mqtt')
var config = require('../config')
var winston = require('winston')
var EventManager = require('../dao/event_manager')
var SettingsManager = require('../dao/settings_manager')

var statusUpdateTopic = '/Status/generic'
var commandTopic = '/Command'

var MessageProcessor = function() {

  var self = this
  SettingsManager.getValue(SettingsManager.MosquittoUser, "", function (savedUser) {
    SettingsManager.getValue(SettingsManager.MosquittoPassword, "", function (savedPassword) {

      self.client = mqtt.connect(config.mqtt.host, {username: savedUser, password: savedPassword})
      self.eventManager = new EventManager()


      self.client.on('connect', function () {
        winston.info('Connected to MQTT broker: %s', config.mqtt.host)
        self.client.subscribe(config.mqtt.rootTopic + statusUpdateTopic);
      });

      self.client.on('message', self.processMessage)
      self.client.on('error', self.handleError)
    })
  })
}

MessageProcessor.prototype.handleError = function(error) {
  winston.error('MQTT error detected:', error)
}

MessageProcessor.prototype.processStatusMessage = function(message) {
  var parsedEvent = this.eventManager.parseMQTTEvent(message.toString())
  if (parsedEvent) {
    this.eventManager.saveEvent(parsedEvent)
  }
}

MessageProcessor.prototype.processMessage = function(topic, message) {
  //winston.info('Message: %s Topic: %s',message.toString(), topic)

  if (topic.endsWith(statusUpdateTopic)) {
    MessageProcessor.prototype.processStatusMessage.call(module.exports,message)
  }
}

MessageProcessor.prototype.sendCommand = function(command){
  winston.info('Sending MQTT message: %s',command)

  this.client.publish(config.mqtt.rootTopic+commandTopic, command)
}


module.exports = new MessageProcessor()