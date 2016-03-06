var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Variable = new Schema({
  variableName : String,
  variableValue : String
})

var VariableModel = mongoose.model('Variable', Variable);

module.exports.Schema = Variable
module.exports.Model = VariableModel