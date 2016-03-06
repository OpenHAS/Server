var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Rule = new Schema({
  ruleEnabled : Boolean,
  ruleName : String,
  conditions : [String],
  actions : [String],
  negativeActions : [String] // negative actions executed if the condition evaluated to false
})

var RuleModel = mongoose.model('Rule', Rule);

module.exports.Schema = Rule
module.exports.Model = RuleModel