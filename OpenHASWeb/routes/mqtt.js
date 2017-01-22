var express = require('express');
var router = express.Router();
var SettingsManager = require('../dao/settings_manager')
var uuidV4 = require('uuid/v4')

router.post('/auth', function(req, res) {
  var username = req.body.username
  var password = req.body.password

  SettingsManager.getValue(SettingsManager.MosquittoUser,uuidV4(),function(savedUser){
    SettingsManager.getValue(SettingsManager.MosquittoPassword,uuidV4(),function(savedPassword){
      if (savedUser == username && savedPassword == password) {
        res.sendStatus(200)
      } else {
        res.sendStatus(401)
      }
    })
  })
})

//no ACL or superuser checking, everybody is on the same privilege level
router.post('/superuser', function(req, res) {
  res.sendStatus(200)
})

module.exports = router