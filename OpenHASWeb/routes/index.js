var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')
var SettingsManager = require('../dao/settings_manager')

/* GET home page. */
router.get('/',function(req, res) {
  res.redirect('/dashboard')
})

router.get('/dashboard', auth.ensureAuthenticatedForDashboard, function(req, res) {
  nodeManager.favouriteNodes(function(nodes){
    SettingsManager.getValue(SettingsManager.SensorMapEnabled,'false',function(mapEnabled) {
      var vm = {}
      vm.nodes = nodes
      vm.editMode = false
      vm.shouldHideTopMenu = !req.isAuthenticated()
      vm.mapEnabled = mapEnabled == 'true'
      res.render('index',{viewModel:vm});
    })
  })
})

module.exports = router;
