var NodeManager = require('../dao/node_manager')
var NodeTypes = require('./node_types')
var wait = require('wait.for')

module.exports = {

  GetNodeState:  function(nodeName) {

    var lastValue = wait.forMethod(NodeManager,'getLastNodeValueByName', nodeName)
    return lastValue
  },

  SetNodeState: function(nodeName, valueToSet) {

  },

  GetVariable : function(variableName) {

    var globals = {}
    globals.Target_Temperature = 1

    console.log('GetVariable called with name:%s', variableName)
    var value = globals[variableName]
    console.log('Returning value: %s', value)
    return value
  }
}