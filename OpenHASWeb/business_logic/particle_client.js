var SettingsManager = require('../dao/settings_manager')
var EventManager = require('../dao/event_manager')

var winston = require('winston')

var Particle = require('particle-api-js');
var particle = new Particle();

var ParticleClient = function () {
  this.token = null
  this.test = "majom"
}

ParticleClient.prototype.login = function() {
  var self = this
  SettingsManager.getValue(SettingsManager.ParticleUsername,"", function (savedUsername) {
    SettingsManager.getValue(SettingsManager.ParticlePassword, "", function (savedPassword) {

      if (savedUsername && savedUsername.length>0 && savedPassword && savedPassword.length>0 ){
          particle.login({username: savedUsername, password: savedPassword}).then(self.handleLoginSuccess, self.handleLoginFailure)
      } else {
        winston.warn('Particle username or password is empty, cannot log in')
      }
    })
  })
}

ParticleClient.prototype.handleLoginSuccess = function(token) {
  var self = module.exports
  winston.info('Logged into Particle cloud')
  self.token = token.body.access_token
  self.subscribeToEvents();
}

ParticleClient.prototype.handleLoginFailure = function (err) {
  winston.error('Error logging into Particle cloud: %s',err)
  this.token = null
}

ParticleClient.prototype.subscribeToEvents = function () {
  winston.info('Subscribing to private device events')

  particle.getEventStream({ deviceId: 'mine', auth: this.token }).then(function(stream) {
    stream.on('event', function(data) {
      winston.info('Particle Event: ' + data.name)
      var eventManager = new EventManager()

      var parsedEvent = eventManager.parseParticleEvent(data)
      if (parsedEvent) {
        eventManager.saveEvent(parsedEvent)
      }
    });
  });
}

module.exports = new ParticleClient()