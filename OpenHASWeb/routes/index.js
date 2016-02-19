var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')

/* GET home page. */
router.get('/',auth.ensureAuthenticated ,function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
