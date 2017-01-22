var express = require('express');
var router = express.Router();
var auth = require('../../business_logic/authentication_handler')
var nodeManager = require('../../dao/node_manager')
var SettingsManager = require('../../dao/settings_manager')
var EventManager = require('../../dao/event_manager')

router.post('/update', auth.ensureAuthenticatedForParticle, function(req, res) {
  console.log('Event: %s', JSON.stringify(req.body))

  var rawEvent = req.body
  rawEvent['name'] = rawEvent.event

  var eventManager = new EventManager()

  var parsedEvent = eventManager.parseParticleEvent(rawEvent)
  if (parsedEvent) {
    eventManager.saveEvent(parsedEvent)
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }

})

module.exports = router;
