'use strict'
var mongoose = require('mongoose')
var winston = require('winston')
var Node = require('./models/node').Model
var Event = require('./models/event').Model

var MessageProcessor = require('../business_logic/message_processor')
var NodeTypes = require('../business_logic/node_types')



var NodeManager = function(){}

NodeManager.prototype.nodes = function(callback) {
  Node.find().sort({nodeName: 'asc'}).exec(function(err, nodes){
    callback(nodes)
  })
}

NodeManager.prototype.favouriteNodes = function(callback) {
  Node.find({favourite:true}).sort({nodeName: 'asc'}).exec(function(err, nodes){
    callback(nodes)
  })
}

NodeManager.prototype.addNode = function(nodeObject, callback) {

  var newNode = new Node()
  newNode.nodeName = nodeObject.nodeName
  newNode.address = nodeObject.nodeAddress
  newNode.favourite = nodeObject.favourite
  newNode.nodeType = nodeObject.nodeType
  newNode.getterFunction = nodeObject.getterFunction
  newNode.setterFunction = nodeObject.setterFunction
  newNode.calibrationFactor = nodeObject.calibrationFactor

  newNode.save(function(err, savedNode){

    if (err) {
      winston.error('Error saving the new node: %s',err)
      callback(false)
    } else {
      winston.info('New node saved with id: %s',savedNode._id.toString())
      callback(true)
    }
  })
}

NodeManager.prototype.modify = function(nodeId, nodeObject, callback) {
  winston.info('Saving node %s', nodeId)

  Node.findOne({_id:nodeId}, function(err, foundNode) {

    if (foundNode) {

      foundNode.nodeName = nodeObject.nodeName
      foundNode.address = nodeObject.nodeAddress
      foundNode.favourite = nodeObject.favourite
      foundNode.nodeType = nodeObject.nodeType
      foundNode.getterFunction = nodeObject.getterFunction
      foundNode.setterFunction = nodeObject.setterFunction
      foundNode.calibrationFactor = nodeObject.calibrationFactor

      foundNode.save(function (err) {

        if (err){
          winston.error('Error updating data on node: %s', nodeId, err)
          if (callback)
            callback(false)
        } else {
          winston.info('Node data updated. Id: %s', nodeId)
          if (callback)
            callback(true)
        }
      });
    } else {
      winston.error('Node not found with id: %s', nodeId, err)
      if (callback)
        callback(false)
    }
  })
}

NodeManager.prototype.delete = function(nodeId, callback) {
  winston.info('Deleting node with id: %s', nodeId)

  Node.remove({_id:nodeId},function(err){
    if (err) {
      winston.error('Error deleting node with id: %s', nodeId, err)
      callback(false)
    } else {
      winston.info('Node deleted with id: %s', nodeId)
      callback(true)
    }
  })
}

NodeManager.prototype.findNodeWithId = function(nodeId, callback) {

  Node.findOne({_id: nodeId}, function (err, foundNode) {

    if (foundNode) {
      callback(foundNode)
    } else {
      winston.error('Node not found with id: %s', nodeId, err)
      callback(null)
    }
  })
}

NodeManager.prototype.findNodeWithName = function(nodeName, callback) {

  Node.findOne({nodeName:nodeName}, function(err, foundNode) {

    if (foundNode) {
      callback(null, foundNode)
    } else {
      winston.error('Node not found with name: %s', nodeName, err)
      callback(err, null)
    }
  })
}


NodeManager.prototype.lastValues = function(nodeId, callback) {

  this.findNodeWithId(nodeId, function (node) {

    if (node) {

      Event.find({source: node.address}).sort({timestamp: 'desc'}).limit(1).exec(function (err, events) {

        if (events.length > 0) {
          callback(node, events[0])
        } else {
          callback(node, null)
        }
      })
    }
    else {
      callback(null)
    }
  })
}

NodeManager.prototype.setValue = function(nodeId, value) {
  this.findNodeWithId(nodeId, function(node){
    if (node) {

      var currentNodeType = NodeTypes.filter(function(element){return element.name==node.nodeType})[0]
      var result = currentNodeType[node.setterFunction](value)

      var command = node.address.replace(':',',') + ','+ result

      var mp = require('../business_logic/message_processor')
      mp.sendCommand(command)
    }
  })
}

NodeManager.prototype.setValueByName = function(nodeName, value, callback) {
  this.findNodeWithName(nodeName, (err, node) => {
    if (node) {

      var currentNodeType = NodeTypes.filter(function(element){return element.name==node.nodeType})[0]
      var result = currentNodeType[node.setterFunction](value)

      var command = node.address.replace(':',',') + ','+ result

      var mp = require('../business_logic/message_processor')
      mp.sendCommand(command)

      callback(null,null) //indicate no error
    } else {
      callback("Node not found",null)
    }
  })
}

NodeManager.prototype.getLastNodeValue = function(node, callback) {
  console.time("GetLastNodeValue")
  Event.find({source: node.address}).sort({timestamp: 'desc'}).limit(1).exec(function (err, events) {
    if (events && events.length > 0){
      var event = events[0]

      var currentNodeType = NodeTypes.filter(function(element){return element.name==node.nodeType})[0]
      var result = {}
      
      result.timestamp = event.timestamp
      result.nodeId = node._id
      result.nodeName = node.nodeName
      result.rawValue = currentNodeType[node.getterFunction](event)
      result.value = currentNodeType[node.getterFunction](event, node.calibrationFactor)

      callback(null, result)
      console.timeEnd("GetLastNodeValue")
    } else {
      callback('Event not found', null)
    }
  })
}

NodeManager.prototype.getLastNodeValueById = function(nodeId, callback) {
  var self = this
  this.findNodeWithId(nodeId, function (node) {
    if (node) {

      self.getLastNodeValue(node, callback);

    } else {
      callback('Node not found', null)
    }
  })
}

NodeManager.prototype.getLastNodeValueByName = function(nodeName, callback) {
  var self = this
  this.findNodeWithName(nodeName, function (err, node) {
    if (node) {

      self.getLastNodeValue(node, callback);

    } else {
      callback('Node not found', null)
    }
  })
}

NodeManager.prototype.getFavoriteNodesLastValue = function (callback) {
  var self = this
  var values = []
  self.favouriteNodes(function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var currentNode = nodes[i];
      self.getLastNodeValue(currentNode,function(error, nodeValue) {

        values.push(nodeValue)

        if (values.length == nodes.length) {

          values.sort(compare)
          callback(values)
        }

      })
    }
  })
}

NodeManager.prototype.getNodeValuesById = function(nodeId, startDate, callback) {
  var self = this
  //first we load up the node
  console.time("getNodeValuesById")
  console.time("findNode")
  this.findNodeWithId(nodeId, function(node, error){
  console.timeEnd("findNode")
    var result = {}
    result.node = node

    if (node) {
      var result = {}
      result.node = node
      result.events = []

      var currentNodeType = NodeTypes.filter(function(element){return element.name==node.nodeType})[0]

      //then load the values for this specific node
      var filter = {}
      filter.source = node.address
      filter.timestamp = {"$gte": startDate}
      console.time("findEvents")
      Event.find(filter).sort({timestamp: 'desc'}).lean(true).exec(function (err, events) {
        console.timeEnd("findEvents")
        console.time("mapEvents")
        for (var i = 0; i < events.length; i++) {
          var currentEvent = events[i]

          var transformedEvent = {}

          transformedEvent.timestamp = currentEvent.timestamp
          transformedEvent.nodeId = node._id
          transformedEvent.nodeName = node.nodeName
          transformedEvent.rawValue = currentNodeType[node.getterFunction](currentEvent)
          transformedEvent.value = currentNodeType[node.getterFunction](currentEvent, node.calibrationFactor)

          result.events.push(transformedEvent)
        }
        console.timeEnd("mapEvents")

        console.timeEnd("getNodeValuesById")
        callback(result, null)
      })

    } else {
      callback(null, "Error loading the node with id")
    }

  })
}

function compare(a,b) {
  if (a.nodeName < b.nodeName)
    return -1;
  else if (a.nodeName > b.nodeName)
    return 1;
  else
    return 0;
}

module.exports = new NodeManager()