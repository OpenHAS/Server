var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var SettingsManager = require('../dao/settings_manager')

router.get('/', auth.ensureAuthenticated, function(req, res){

  SettingsManager.getValue(SettingsManager.MosquittoUser,"",function(savedUser){
    SettingsManager.getValue(SettingsManager.MosquittoPassword,"",function(savedPassword){
      var vm = {}

      vm.mqtt_username = savedUser
      vm.mqtt_password = savedPassword
      vm.web_username = 'admin'
      vm.web_password = 'admin'

      res.render('settings', {viewModel:vm})
    })
  })
})

router.post('/mqtt', auth.ensureAuthenticated, function(req, res){

  SettingsManager.setValue(SettingsManager.MosquittoUser, req.body.mqtt_username, function(err, savedUser){
    SettingsManager.setValue(SettingsManager.MosquittoPassword, req.body.mqtt_password, function(err, savedPassword){
      res.redirect('/settings')
    })
  })
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