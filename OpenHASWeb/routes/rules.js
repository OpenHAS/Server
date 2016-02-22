var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')

/* GET home page. */
router.get('/', auth.ensureAuthenticated, function(req, res) {
  res.render('rules');
});

router.get('/new', auth.ensureAuthenticated, function(req, res) {
  res.render('rule_editor');
});

module.exports = router;
