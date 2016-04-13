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
          callback(values)
        }

      })
    }
  })
}

module.exports = new NodeManager()