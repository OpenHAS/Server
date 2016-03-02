var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')
var nodeManager = require('../dao/node_manager')

/* GET home page. */
router.get('/',auth.ensureAuthenticated ,function(req, res) {
  res.redirect('/dashboard')
})

router.get('/dashboard', auth.ensureAuthenticated, function(req, res) {
  nodeManager.favouriteNodes(function(nodes){
    res.render('index',{nodes:nodes});
  })
})

module.exports = router;
