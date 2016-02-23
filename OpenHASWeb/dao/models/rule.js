var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Rule = new Schema({
  enabled : Boolean,
  ruleName : String,
  sourceNetwork : String,
  conditions : [String],
  actions : [String]
})

var RuleModel = mongoose.model('Rule', Rule);

module.exports.Schema = Rule
module.exports.Model = RuleModel