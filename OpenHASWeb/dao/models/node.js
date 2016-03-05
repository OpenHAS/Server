var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Node = new Schema({
  address : String,
  nodeName : String,
  parameterIndex : Number,
  measurementUnit : String,
  refreshRate : Number,
  favourite : Boolean,
  nodeType : { type: String, default: 'Sensor' }
})

var NodeModel = mongoose.model('Node', Node);

module.exports.Schema = Node
module.exports.Model = NodeModel