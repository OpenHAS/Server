var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var SettingsManager = require('../dao/settings_manager')

router.get('/', auth.ensureAuthenticated, function(req, res){
  var vm = {}

  vm.mqtt_username = 'testuser'
  vm.mqtt_password = 'test_pass-word_test'
  vm.web_username = 'admin'
  vm.web_password = 'admin'

  res.render('settings', {viewModel:vm})
})

router.get('/:settingsKey/value', auth.ensureAuthenticated, function(req, res){

  SettingsManager.getValue(req.params.settingsKey, req.query.default, function(value){

    res.send({result:value})

  })
})

router.post('/:settingsKey/value', auth.ensureAuthenticated, function(req, res){

  SettingsManager.setValue(req.params.settingsKey, req.body.value, function(err, setting){
    res.send({result:setting.settingValue})
  })
})

module.exports = router