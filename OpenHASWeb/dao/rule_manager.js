var mongoose = require('mongoose')
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

RuleManager.prototype.delete = function(ruleId, callback) {
  winston.info('Deleting rule with id: %s', ruleId)

  Rule.remove({_id:ruleId},function(err){
    if (err) {
      winston.error('Error deleting rule with id: %s', ruleId, err)
      callback(false)
    } else {
      winston.info('Rule deleted with id: %s', ruleId)
      callback(true)
    }
  })
}

RuleManager.prototype.findRuleWithId = function(ruleId, callback) {

  Rule.findOne({_id:ruleId}, function(err, foundRule) {

    if (foundRule) {
      callback(foundRule)
    } else {
      winston.error('Rule not found with id: %s', ruleId, err)
      callback(null)
    }
  })
}

RuleManager.prototype.copyRuleWithId = function(ruleId, callback) {
  winston.info('Duplicating rule with id: %s', ruleId)
  this.findRuleWithId(ruleId, function(rule){
    if(rule){
      var copy = new Rule(rule)

      copy.ruleName = 'Copy of '+rule.ruleName
      copy.isNew = true
      copy._id = mongoose.Types.ObjectId()

      copy.save(function(err, savedCopy){
        if (err) {
          winston.error('Error saving the copied instance of %s', ruleId, err)
          callback(false)
        } else {
          winston.info('Copied instance with id: %s, new id: %s', ruleId, savedCopy._id)
          callback(true)
        }
      })
    } else {
      callback(false)
    }
  })
}

module.exports = new RuleManager()
