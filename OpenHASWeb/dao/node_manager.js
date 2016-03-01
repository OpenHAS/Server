var mongoose = require('mongoose')
var Node = require('./models/node').Model
var winston = require('winston')


var NodeManager = function(){}

NodeManager.prototype.nodes = function(callback) {
  Node.find(function(err, nodes){
    callback(nodes)
  })
}

NodeManager.prototype.addNode = function(nodeObject, callback) {

  var newNode = new Node()
  newNode.nodeName = nodeObject.nodeName
  newNode.address = nodeObject.nodeAddress
  newNode.parameterIndex = nodeObject.parameterIndex
  newNode.measurementUnit = nodeObject.measurementUnit
  newNode.refreshRate = nodeObject.refreshRate

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
      foundNode.parameterIndex = nodeObject.parameterIndex
      foundNode.measurementUnit = nodeObject.measurementUnit
      foundNode.refreshRate = nodeObject.refreshRate

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

  Node.findOne({_id:nodeId}, function(err, foundNode) {

    if (foundNode) {
      callback(foundNode)
    } else {
      winston.error('Node not found with id: %s', nodeId, err)
      callback(null)
    }
  })
}

NodeManager.prototype.copyNodeWithId = function(nodeId, callback) {
  winston.info('Duplicating node with id: %s', nodeId)
  this.findNodeWithId(nodeId, function(node){
    if(node){
      var copy = new Node(node)

      copy.nodeName = 'Copy of '+node.nodeName
      copy.isNew = true
      copy._id = mongoose.Types.ObjectId()

      copy.save(function(err, savedCopy){
        if (err) {
          winston.error('Error saving the copied instance of node %s', nodeId, err)
          callback(false)
        } else {
          winston.info('Copied node with id: %s, new id: %s', nodeId, savedCopy._id.toString())
          callback(true)
        }
      })
    } else {
      callback(false)
    }
  })
}

module.exports = new NodeManager()