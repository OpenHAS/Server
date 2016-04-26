var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var SettingsManager = require('../dao/settings_manager')
var uuid = require('node-uuid')
var SlackClient = require('../business_logic/slack_client')
var Q = require('q')

router.get('/', auth.ensureAuthenticated, function (req, res) {

  Q.all(
    [
      SettingsManager.getValueDeferred(SettingsManager.MosquittoUser,""),
      SettingsManager.getValueDeferred(SettingsManager.MosquittoPassword, ""),
      SettingsManager.getValueDeferred(SettingsManager.ApiToken, ""),
      SettingsManager.getValueDeferred(SettingsManager.ApiEnabled, "false"),
      SettingsManager.getValueDeferred(SettingsManager.AnonymousDashboardAccess, "false"),
      SettingsManager.getValueDeferred(SettingsManager.SlackToken, "")
    ])
    .spread(function(mqtt_username, mqtt_password, api_token, api_enabled, anon_access_enabled, slack_token){
      var vm = {}

      vm.mqtt_username = mqtt_username
      vm.mqtt_password = mqtt_password
      vm.web_username = 'admin'
      vm.web_password = 'admin'
      vm.api_token = api_token
      vm.api_access_enabled = api_enabled == 'true'
      vm.anonymous_dashboard_access = anon_access_enabled == 'true'
      vm.slack_token = slack_token

      res.render('settings', {viewModel: vm})
    })
})

router.post('/mqtt', auth.ensureAuthenticated, function (req, res) {

  SettingsManager.setValue(SettingsManager.MosquittoUser, req.body.mqtt_username, function (err, savedUser) {
    SettingsManager.setValue(SettingsManager.MosquittoPassword, req.body.mqtt_password, function (err, savedPassword) {
      res.redirect('/settings')
    })
  })
})

router.post('/slack', auth.ensureAuthenticated, function (req, res) {

  SettingsManager.setValue(SettingsManager.SlackToken, req.body.slack_token, function (err, savedToken) {
    SlackClient.connect() //reinit the connection
    res.redirect('/settings')
  })

})

router.get('/:settingsKey/value', auth.ensureAuthenticated, function (req, res) {

  SettingsManager.getValue(req.params.settingsKey, req.query.default, function (value) {

    res.send({result: value})

  })
})

router.post('/:settingsKey/value', auth.ensureAuthenticated, function (req, res) {

  SettingsManager.setValue(req.params.settingsKey, req.body.value, function (err, setting) {
    res.send({result: setting.settingValue})
  })
})

router.post('/regenerate_api_token', auth.ensureAuthenticated, function (req, res) {
  var newToken = uuid.v4()
  SettingsManager.setValue(SettingsManager.ApiToken, newToken, function (err, setting) {
    res.send({api_token: newToken})
  })
})

module.exports = router