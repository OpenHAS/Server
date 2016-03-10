var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var VariableManager = require('../dao/variable_manager')

router.get('/', auth.ensureAuthenticated, function(req, res){

  VariableManager.variables(function(err, variables) {

    var vm = {}
    vm.variables = variables
    res.render('variables', {viewModel:vm})

  })
})

router.post('/', auth.ensureAuthenticated, function(req, res) {
  VariableManager.addVariable(req.body.varName, req.body.varValue, function(err, saved){
    res.redirect('/variables')
  })
})

router.get('/:variableId/delete', auth.ensureAuthenticated, function (req, res) {
  VariableManager.deleteVariable(req.params.variableId,function(error){
    res.redirect('/variables')
  })
})

module.exports = router