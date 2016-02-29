var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')

router.get('/', auth.ensureAuthenticated, function(req, res) {
  nodeManager.nodes(function(nodes){
    res.render('nodes', {nodes:nodes});
  })
});

router.get('/new', auth.ensureAuthenticated, function(req, res) {

  var vm = {}
  vm.title = 'Create new node'
  vm.nodeName = ''
  vm.nodeAddress = ''
  vm.parameterIndex = '1'
  vm.measurementUnit = ''
  vm.refreshRate = '10'

  res.render('node_editor',{viewModel:vm});
});

router.post('/new', auth.ensureAuthenticated, function(req, res) {

  var nodeObject = {}
  nodeObject.nodeName = req.body.nodeName
  nodeObject.nodeAddress = req.body.nodeAddress
  nodeObject.parameterIndex = req.body.parameterIndex
  nodeObject.measurementUnit = req.body.measurementUnit
  nodeObject.refreshRate = req.body.refreshRate

  nodeManager.addNode(nodeObject, function() {
    res.redirect('/nodes')
  })
})


module.exports = router