var math = require('mathjs');
//var globals = require('./global_variables')
var parserFunctions = require('./parser_functions')
var wait = require('wait.for')
var winston = require('winston')

math.import({
  GetNodeState : parserFunctions.GetNodeState,
  GetVariable : parserFunctions.GetVariable,
  SetNodeState : parserFunctions.SetNodeState
})


var RuleManager = require('../dao/rule_manager')

var RuleEngine = function() {
  setInterval(this.process, 5000)
  this.processInProgress = false
}

RuleEngine.prototype.process = function() {
  if (this.processInProgress) {
    //return
  }

  this.processInProgress = true

  //get all the active rules
  RuleManager.rules(function(rules){
    rules.filter(function(currentRule){
      return currentRule.ruleEnabled==true
    }).forEach(function(currentRule){

      var singleCondition = currentRule.conditions[0]
      var singleAction = currentRule.actions[0]
      var singleNegativeAction = currentRule.negativeActions[0]

      wait.launchFiber(function(){

        //evaluating condition
        try {
          var evaluationResult = math.eval(singleCondition)
          winston.info('Condition evaluation result: %s', evaluationResult)
        }
        catch(err) {
          winston.error('Error evaluating condition: %s', singleCondition, err)
        }

        //executing normal actions
        try {
          if (evaluationResult == true && singleAction) {
            math.eval(singleAction)
            winston.info('Action evaluated')
          }
        }
        catch(err) {
          winston.error('Error evaluating action: %s', singleAction, err)
        }

        //executing negative actions
        try {
          if (evaluationResult == false && singleNegativeAction) {
            math.eval(singleNegativeAction)
            winston.info('Negative action evaluated')
          }
        }
        catch(err) {
          winston.error('Error evaluating negative action: %s', singleNegativeAction, err)
        }
      })

      this.processInProgress = false
    })
  })
}

module.exports = new RuleEngine()