var Rule = require('./models/rule').Model
var winston = require('winston')

var RuleManager = function() {
}

RuleManager.prototype.addRule = function(ruleName, sourceNetwork, condition, action, callback) {

  var newRule = new Rule()
  newRule.enabled = true
  newRule.ruleName = ruleName
  newRule.sourceNetwork = sourceNetwork
  newRule.conditions.push(condition)
  newRule.actions.push(action)

  newRule.save(function(err, savedRule){

    if (err) {
      winston.error('Error saving the new rule: %s',err)
      callback(false)
    } else {
      winston.info('New rule saved with id: %s',savedRule._id)
      callback(true)
    }
  })
}

RuleManager.prototype.rules = function(callback) {
  Rule.find(function(err, rules){
    callback(rules)
  })
}

RuleManager.prototype.setState = function(ruleId, state) {
  winston.info('Saving rule state to %s on %s',state, ruleId)

  Rule.findOne({_id:ruleId}, function(err, foundRule) {

    if (foundRule) {
      foundRule.enabled = state
      foundRule.save(function (err) {

        if (err){
          winston.error('Error setting the new state on rule: %s', ruleId, err)
        } else {
          winston.info('Rule state updated. Id: %s', ruleId)
        }
      });
    } else {
      winston.error('Rule not found with id: %s', ruleId, err)
    }
  })
}

module.exports = new RuleManager()
