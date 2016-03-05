var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Node = new Schema({
  address : String,
  nodeName : String,
  favourite : Boolean,
  nodeType : String,
  getterFunction : String,
  setterFunction : String
})

var NodeModel = mongoose.model('Node', Node);

module.exports.Schema = Node
module.exports.Model = NodeModel