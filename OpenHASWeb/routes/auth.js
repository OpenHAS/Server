'use strict';
var express = require('express');
var router = express.Router();
var auth = require('../business_logic/authentication_handler')

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login')
});

router.post('/login', auth.authenticate('local', { successRedirect: '/', failureRedirect: '/auth/login' }));

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/auth/login');
});

module.exports = router;