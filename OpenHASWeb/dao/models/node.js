var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Event = require('./event')

var Node = new Schema({
  address : String,
  nodeName : String,
  favourite : Boolean,
  nodeType : String,
  getterFunction : String,
  setterFunction : String,
  events : [Event.Schema],
  calibrationFactor : Number
})

var NodeModel = mongoose.model('Node', Node);

module.exports.Schema = Node
module.exports.Model = NodeModel