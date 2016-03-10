var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var ruleManager = require('../dao/rule_manager')

/* GET home page. */
router.get('/', auth.ensureAuthenticated, function(req, res) {
  ruleManager.rules(function(rules){
    res.render('rules', {rules:rules});
  })
});

router.get('/new', auth.ensureAuthenticated, function(req, res) {

  var vm = {}
  vm.title = 'Create new rule'
  vm.ruleName = ''
  vm.condition = ''
  vm.action = ''
  vm.negativeAction = ''

  res.render('rule_editor',{viewModel:vm});
});

router.post('/new', auth.ensureAuthenticated, function(req, res) {

  var ruleName = req.body.ruleName
  var condition = req.body.condition
  var action = req.body.action
  var negativeAction = req.body.negativeAction

  ruleManager.addRule(ruleName,condition,action, negativeAction, function(isSuccess) {
    res.redirect('/rules')
  })
})

router.post('/:ruleId/updateState', auth.ensureAuthenticated, function(req, res) {
  ruleManager.modify(req.params.ruleId, req.body.state)
  res.sendStatus(200)
})

router.get('/:ruleId/delete', auth.ensureAuthenticated, function (req, res) {
  ruleManager.delete(req.params.ruleId,function(isSuccess){
    res.redirect('/rules')
  })
})

router.get('/:ruleId/copy', auth.ensureAuthenticated, function(req, res) {
  ruleManager.copyRuleWithId(req.params.ruleId, function(isSuccess){
    res.redirect('/rules')
  })
})

router.get('/:ruleId/edit', auth.ensureAuthenticated, function(req, res) {
  ruleManager.findRuleWithId(req.params.ruleId, function(foundRule){
    if (foundRule) {

      var vm = {}
      vm.title = 'Edit rule'
      vm.ruleName = foundRule.ruleName
      vm.condition = foundRule.conditions[0]
      vm.action = foundRule.actions[0]
      vm.negativeAction = foundRule.negativeActions[0]

      res.render('rule_editor',{viewModel:vm})
    } else {
      res.redirect('/rules')
    }
  })
})

router.post('/:ruleId/edit', auth.ensureAuthenticated, function(req, res) {

  var ruleName = req.body.ruleName
  var condition = req.body.condition
  var action = req.body.action
  var negativeAction = req.body.negativeAction

  ruleManager.modify(req.params.ruleId, req.body.state, ruleName, condition, action, negativeAction,function(isSuccess){
    res.redirect('/rules')
  })

})

module.exports = router;
