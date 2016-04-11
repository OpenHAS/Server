var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')
var NodeTypes = require('../business_logic/node_types')

router.get('/', auth.ensureAuthenticated, function(req, res) {
  nodeManager.nodes(function(nodes){
    var vm = {}
    vm.nodes = nodes
    vm.editMode = true
    res.render('nodes', {viewModel:vm});
  })
});

router.get('/new', auth.ensureAuthenticated, function(req, res) {

  var vm = {}
  vm.title = 'Create new node'
  vm.nodeName = ''
  vm.nodeAddress = ''
  vm.favourite = true
  vm.nodeType = NodeTypes[0].name
  vm.nodeTypes = NodeTypes
  vm.getterFunction = NodeTypes[0].getters[0]
  vm.calibrationFactor = 0

  res.render('node_editor',{viewModel:vm});
});

router.post('/new', auth.ensureAuthenticated, function(req, res) {

  var nodeObject = {}
  nodeObject.nodeName = req.body.nodeName
  nodeObject.nodeAddress = req.body.nodeAddress
  nodeObject.nodeType = req.body.nodeType
  nodeObject.favourite = req.body.favourite == 'on'
  nodeObject.getterFunction = req.body.getterFunction
  nodeObject.setterFunction = req.body.setterFunction

  var cf = req.body.calibrationFactor
  if (cf != '' && cf != 0) {
    nodeObject.calibrationFactor = cf
  } else {
    nodeObject.calibrationFactor = undefined
  }

  nodeManager.addNode(nodeObject, function() {
    res.redirect('/nodes')
  })
})

router.get('/:nodeId/edit', auth.ensureAuthenticated, function(req, res) {
  nodeManager.findNodeWithId(req.params.nodeId, function(foundNode){
    if (foundNode) {

      var vm = {}
      vm.title = 'Edit node'
      vm.nodeName = foundNode.nodeName
      vm.nodeAddress = foundNode.address
      vm.parameterIndex = foundNode.parameterIndex
      vm.measurementUnit = foundNode.measurementUnit
      vm.favourite = foundNode.favourite
      vm.refreshRate = foundNode.refreshRate
      vm.nodeType = foundNode.nodeType
      vm.nodeTypes = NodeTypes
      vm.getterFunction = foundNode.getterFunction
      vm.setterFunction = foundNode.setterFunction
      if (foundNode.calibrationFactor != undefined) {
        vm.calibrationFactor = foundNode.calibrationFactor
      } else {
        vm.calibrationFactor = ''
      }

      res.render('node_editor',{viewModel:vm})
    } else {
      res.redirect('/nodes')
    }
  })
})

router.post('/:nodeId/edit', auth.ensureAuthenticated, function(req, res) {

  var nodeObject = {}
  nodeObject.nodeName = req.body.nodeName
  nodeObject.nodeAddress = req.body.nodeAddress
  nodeObject.favourite = req.body.favourite == 'on'
  nodeObject.nodeType = req.body.nodeType
  nodeObject.getterFunction = req.body.getterFunction
  nodeObject.setterFunction = req.body.setterFunction

  var cf = req.body.calibrationFactor
  if (cf != '' && cf != 0) {
    nodeObject.calibrationFactor = cf
  } else {
    nodeObject.calibrationFactor = undefined
  }

  nodeManager.modify(req.params.nodeId, nodeObject, function() {
    res.redirect('/nodes')
  })
})

router.get('/:nodeId/delete', auth.ensureAuthenticated, function (req, res) {
  nodeManager.delete(req.params.nodeId,function(isSuccess){
    res.redirect('/nodes')
  })
})

router.get('/:nodeId/value', auth.ensureAuthenticatedForDashboard, function(req, res) {
  
  nodeManager.getLastNodeValueById(req.params.nodeId, function(error, lastEvent) {
    res.send({result:lastEvent})
  })
})

router.post('/:nodeId/setValue', auth.ensureAuthenticated, function(req,res) {

  var valueToSend = req.body.value
  nodeManager.setValue(req.params.nodeId,valueToSend)
  res.sendStatus(200)
})


module.exports = router