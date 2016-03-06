var mongoose = require('mongoose')
var Variable = require('./models/variable').Model
var winston = require('winston')

var VariableManager = function() {
}

VariableManager.prototype.variables = function(callback) {
  Variable.find(function(err, variables){
    callback(err, variables)
  })
}

VariableManager.prototype.addVariable = function(name, value, callback){
  var newVar = new Variable()
  newVar.variableName = name
  newVar.variableValue = value

  newVar.save(function(err, savedVar){
    callback(err, savedVar)
  })
}

VariableManager.prototype.modifyVariable = function(varId, newValue, callback) {

  Variable.findOne({_id:varId}, function(err, foundVar) {
    if (foundVar) {

      foundVar.variableValue = newValue

      foundVar.save(function(err, savedVar){
        callback(err, savedVar)
      })

    } else {
      callback(err, null)
    }
  })
}

VariableManager.prototype.deleteVariable = function(varId, callback) {

  Variable.remove({_id:varId},function(err){
    if (err) {
      winston.error('Error deleting variable with id: %s', varId.toString(), err)
      callback(err)
    } else {
      winston.info('Rule deleted with id: %s', varId)
      callback(null)
    }
  })
}

VariableManager.prototype.variableByName = function(variableName, callback) {
  Variable.findOne({variableName:variableName}, callback)
}


module.exports = new VariableManager()