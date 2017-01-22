var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var SettingsManager = require('../dao/settings_manager')
var uuidV4 = require('uuid/v4')
var SlackClient = require('../business_logic/slack_client')
var UserManager = require('../dao/user_manager')

var Q = require('q')

var ADMIN_USER_NAME = 'admin'

router.get('/', auth.ensureAuthenticated, function (req, res) {

  Q.all(
    [
      UserManager.getUserDeferred(ADMIN_USER_NAME),
      SettingsManager.getValueDeferred(SettingsManager.MosquittoUser,""),
      SettingsManager.getValueDeferred(SettingsManager.MosquittoPassword, ""),
      SettingsManager.getValueDeferred(SettingsManager.ApiToken, ""),
      SettingsManager.getValueDeferred(SettingsManager.ApiEnabled, "false"),
      SettingsManager.getValueDeferred(SettingsManager.AnonymousDashboardAccess, "false"),
      SettingsManager.getValueDeferred(SettingsManager.SlackToken, ""),
      SettingsManager.getValueDeferred(SettingsManager.ParticleSecurityToken, ""),
      SettingsManager.getValueDeferred(SettingsManager.SensorMapEnabled, "false")
    ])
    .spread(function(foundUser, mqtt_username, mqtt_password, api_token, api_enabled, anon_access_enabled, slack_token, particle_token, sensor_map_enabled){
      var vm = {}

      vm.mqtt_username = mqtt_username
      vm.mqtt_password = mqtt_password
      vm.web_username = foundUser.username
      vm.web_password = foundUser.password
      vm.api_token = api_token
      vm.api_access_enabled = api_enabled == 'true'
      vm.anonymous_dashboard_access = anon_access_enabled == 'true'
      vm.slack_token = slack_token
      vm.particle_token = particle_token
      vm.sensor_map_enabled = sensor_map_enabled == 'true'

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
  var newToken = uuidV4()
  SettingsManager.setValue(SettingsManager.ApiToken, newToken, function (err, setting) {
    res.send({api_token: newToken})
  })
})

router.post('/regenerate_particle_token', auth.ensureAuthenticated, function (req, res) {
  var newToken = uuidV4()
  SettingsManager.setValue(SettingsManager.ParticleSecurityToken, newToken, function (err, setting) {
    res.send({particle_token: newToken})
  })
})

router.post('/update_web_password', auth.ensureAuthenticated, function (req, res) {

  UserManager.updatePassword(ADMIN_USER_NAME, req.body.web_password, function () {
    res.redirect('/auth/logout')
  })

})

module.exports = router