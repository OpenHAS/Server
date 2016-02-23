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
  res.render('rule_editor');
});

router.post('/new', auth.ensureAuthenticated, function(req, res) {

  var ruleName = req.body.ruleName
  var sourceNetwork = req.body.sourceNetwork
  var condition = req.body.condition
  var action = req.body.action

  ruleManager.addRule(ruleName,sourceNetwork,condition,action, function(isSuccess){
    res.redirect('/rules')
  })
})

router.post('/:ruleId/updateState', auth.ensureAuthenticated, function(req, res){
  ruleManager.setState(req.params.ruleId, req.body.state)
})

module.exports = router;
