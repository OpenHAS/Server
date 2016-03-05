var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')

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
  vm.parameterIndex = '0'
  vm.measurementUnit = '°C'
  vm.refreshRate = '10'
  vm.favourite = true
  vm.nodeType = 'Sensor'

  res.render('node_editor',{viewModel:vm});
});

router.post('/new', auth.ensureAuthenticated, function(req, res) {

  var nodeObject = {}
  nodeObject.nodeName = req.body.nodeName
  nodeObject.nodeAddress = req.body.nodeAddress
  nodeObject.parameterIndex = req.body.parameterIndex
  nodeObject.measurementUnit = req.body.measurementUnit
  nodeObject.refreshRate = req.body.refreshRate
  nodeObject.nodeType = req.body.nodeType

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
  nodeObject.parameterIndex = req.body.parameterIndex
  nodeObject.measurementUnit = req.body.measurementUnit
  nodeObject.refreshRate = req.body.refreshRate
  nodeObject.favourite = req.body.favourite == 'on'
  nodeObject.nodeType = req.body.nodeType

  nodeManager.modify(req.params.nodeId, nodeObject, function() {
    res.redirect('/nodes')
  })
})

router.get('/:nodeId/delete', auth.ensureAuthenticated, function (req, res) {
  nodeManager.delete(req.params.nodeId,function(isSuccess){
    res.redirect('/nodes')
  })
})

router.get('/:nodeId/value', auth.ensureAuthenticated, function(req, res) {
  nodeManager.lastValues(req.params.nodeId, function(node, lastEvent) {
    if (lastEvent) {
      var index = node.parameterIndex

      var vm = {}
      vm.nodeId = node._id
      vm.value = lastEvent.parameters[index]
      vm.timestamp = lastEvent.timestamp

      res.send({result:vm})
    } else {
      res.send({result:null})
    }
  })
})

router.post('/:nodeId/setOutputState', auth.ensureAuthenticated, function(req,res) {

  var message = 'SetRelay,0,'+req.body.state
  nodeManager.sendMessageToNode(req.params.nodeId,message)
})


module.exports = router