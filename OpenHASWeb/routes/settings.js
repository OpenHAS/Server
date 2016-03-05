var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')

router.get('/', auth.ensureAuthenticated, function(req, res){
  var vm = {}

  vm.mqtt_username = 'testuser'
  vm.mqtt_password = 'test_pass-word_test'
  vm.web_username = 'admin'
  vm.web_password = 'admin'

  res.render('settings', {viewModel:vm})
})

module.exports = router