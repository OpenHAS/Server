var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')
var NodeTypes = require('../business_logic/node_types')
var ReportGenerator = require('../business_logic/report_generator')
var winston = require('winston')

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

router.get('/:nodeId/detail', auth.ensureAuthenticatedForDashboard, function (req, res) {

  var vm = {}
  vm.editMode = false
  vm.shouldHideTopMenu = !req.isAuthenticated()

  var timeSpan = 1
  if (req.query.offset && isNumeric(req.query.offset) && req.query.offset <= 365 & req.query.offset >= 1) {
    timeSpan = parseInt(req.query.offset)
  }

  var yesterday = new Date()
  yesterday.setDate(yesterday.getDate()-1)

  nodeManager.getNodeValuesById(req.params.nodeId, yesterday, function (nodeLookupResult) {

    var nodeReport = ReportGenerator.report[req.params.nodeId]

    if (nodeReport) {

      var result = []

      switch (timeSpan) {
        case 1:
          result = nodeLookupResult.events
          break
        case 7:
           result = nodeReport.last7Days
          break
        case 30:
          result = nodeReport.last30Days
          break
        case 365:
          result = nodeReport.last365Days
          break
        default:
          break
      }

      winston.info("Got %s events", result.length)

      vm.offset = timeSpan
      vm.node = nodeLookupResult.node
      vm.events = result

      var min = Number.MAX_VALUE
      var max = Number.MIN_VALUE
      var sum = 0
      var count = 0
      for (var i = 0; i < result.length; i++) {
        var currentEvent = result[i];

        if (isNumeric(currentEvent.value)) {
          if (currentEvent.value < min) {
            min = currentEvent.value
          }

          if (currentEvent.value > max) {
            max = currentEvent.value
          }
          sum += currentEvent.value
          count++
        }
      }

      vm.minValue = '--'
      vm.maxValue = '--'
      vm.avgValue = '--'
      vm.count = count
      vm.firstTimestamp = "--"
      vm.lastTimestamp = "--"
      vm.lastValue = "--"

      if (result.length > 0) {

        vm.firstTimestamp = new Date(result[0].timestamp).toLocaleString('hu-HU')

        var ts = result[result.length-1].timestamp
        vm.lastTimestamp = new Date(ts).toLocaleString('hu-HU')

        vm.lastValue = result[0].value.toFixed(1)
        vm.minValue = min.toFixed(1)
        vm.maxValue = max.toFixed(1)
        vm.avgValue = (sum / count).toFixed(1)
      }

      res.render('node_detail',{viewModel:vm});

    }
  })
})

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = router