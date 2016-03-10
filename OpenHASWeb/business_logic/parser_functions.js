var NodeManager = require('../dao/node_manager')
var VariableManager = require('../dao/variable_manager')
var winston = require('winston')
var NodeTypes = require('./node_types')
var wait = require('wait.for')

module.exports = {

  GetNodeState:  function(nodeName) {

    var lastValue = wait.forMethod(NodeManager,'getLastNodeValueByName', nodeName)
    return lastValue
  },

  SetNodeState: function(nodeName, valueToSet) {

    var result = wait.forMethod(NodeManager,'setValueByName', nodeName, valueToSet)

  },

  GetVariable : function(variableName) {

    var variable = wait.forMethod(VariableManager,'variableByName', variableName)

    if (variable) {
      winston.info('Returning value: %s for %s', variable.variableValue, variableName)
      return variable.variableValue
    } else {
      winston.error('Variable not found: %s',variableName)
      throw "Variable not found"
    }
  }
}