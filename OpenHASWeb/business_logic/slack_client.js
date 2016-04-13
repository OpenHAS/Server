// Requiring our module
var slackAPI = require('slackbotapi');
var SettingsManager = require('../dao/settings_manager')
var NodeManager = require('../dao/node_manager')
var moment = require('moment')

var SlackClient = function() {
  this.connect()
}

SlackClient.prototype.connect = function() {

  var self = this

  SettingsManager.getValue(SettingsManager.SlackToken, "", function (savedSlackToken) {

    if (savedSlackToken != '') {

      try {

        self.slack = new slackAPI({
          'token': savedSlackToken,
          'logging': true,
          'autoReconnect': true
        });

        self.slack.on('message', function(data) {

          self.processMessage(data)
        })

      }
      catch (error) {
      }
    } else {
      self.slack = null
    }
  })
}

SlackClient.prototype.processMessage = function(data) {

  var self = this
  if (data.text === 'temperature') {

    NodeManager.getFavoriteNodesLastValue(function(lastValues) {

      var minimum = Number.MAX_VALUE
      var minimumNode = ""

      var maximum = Number.MIN_VALUE
      var maximumNode = ""

      var avg = 0
      var avgCounter = 0

      var msgToSend = "*Temperature report:*\n\n"

      for (var i = 0; i < lastValues.length; i++) {
        var currentNode = lastValues[i];
        var value = parseFloat(currentNode.value).toFixed(1)

        if (value != 'NaN') {

          var message = '*'+currentNode.nodeName + ":* " + value + "℃ @"+"\n"
          msgToSend += message

          if (value < minimum) {
            minimum = value
            minimumNode = currentNode.nodeName
          }

          if (value > maximum) {
            maximum = value
            maximumNode = currentNode.nodeName
          }

          avg += parseFloat(value)
          avgCounter++
        }
      }

      if (avgCounter > 0){
        var minMessage = '\n\n*Minimum:* '+minimum+'℃ @ '+minimumNode + '\n'
        var maxMessage = '*Maximum:* '+maximum+'℃ @ '+maximumNode + '\n'
        var avgMessage = '*Average:* '+parseFloat(avg/avgCounter).toFixed(1)+'℃ of '+avgCounter+' nodes'
        msgToSend += minMessage
        msgToSend += maxMessage
        msgToSend += avgMessage

      }

      self.slack.sendMsg(data.channel, msgToSend);
    })


  }
}

module.exports = new SlackClient()

