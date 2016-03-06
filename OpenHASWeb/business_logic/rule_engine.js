var math = require('mathjs');
//var globals = require('./global_variables')
var parserFunctions = require('./parser_functions')
var wait = require('wait.for')

math.import({
  GetNodeState : parserFunctions.GetNodeState,
  GetVariable : parserFunctions.GetVariable,
  SetNodeState : parserFunctions.SetNodeState
})


var RuleManager = require('../dao/rule_manager')

var RuleEngine = function() {
  setInterval(this.process, 1000)
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

      //math.eval(singleCondition)

      wait.launchFiber(math.eval,singleCondition)
      this.processInProgress = false
    })
  })
}

module.exports = new RuleEngine()