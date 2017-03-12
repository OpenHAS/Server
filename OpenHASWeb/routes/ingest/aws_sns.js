var express = require('express');
var winston = require('winston')
var https = require('https')
var MessageValidator = require('sns-validator')
var auth = require('../../business_logic/authentication_handler')
var nodeManager = require('../../dao/node_manager')
var SettingsManager = require('../../dao/settings_manager')
var EventManager = require('../../dao/event_manager')

var router = express.Router();
var validator = new MessageValidator();

router.post('/update', function(req, res) {

  var message = JSON.parse(req.body)

  validator.validate(message, function (err, message) {
    if (err) {
      winston.error('Error validating incoming SNS notification message. Error: %s', err)
      return
    }

    if (message['Type'] === 'SubscriptionConfirmation') {
      https.get(message['SubscribeURL'], function (res) {
        // You have confirmed your endpoint subscription
        winston.info('Confirming SNS subscription')
      });
    }

    if (message['Type'] === 'UnsubscribeConfirmation') {
      https.get(message['SubscribeURL'], function (res) {
        winston.info('Confirming SNS unsubscribe')
      });
    }

    if (message['Type'] === 'Notification') {
      // Do whatever you want with the message body and data.
      winston.info(message['MessageId'] + ': ' + message['Message']);
    }
  })
})

module.exports = router;
