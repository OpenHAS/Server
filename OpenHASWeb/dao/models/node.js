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
  calibrationFactor : Number,
  lowerLimit : {type:Number, default: undefined},
  upperLimit : {type:Number, default: undefined}
})

var NodeModel = mongoose.model('Node', Node);

module.exports.Schema = Node
module.exports.Model = NodeModel