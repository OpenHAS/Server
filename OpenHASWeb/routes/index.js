var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')

/* GET home page. */
router.get('/',function(req, res) {
  res.redirect('/dashboard')
})

router.get('/dashboard', auth.ensureAuthenticatedForDashboard, function(req, res) {
  nodeManager.favouriteNodes(function(nodes){
    var vm = {}
    vm.nodes = nodes
    vm.editMode = false
    vm.shouldHideTopMenu = !req.isAuthenticated()
    res.render('index',{viewModel:vm});
  })
})

module.exports = router;
