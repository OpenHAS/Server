var User = require('./models/user').Model
var winston = require('winston')
var uuidV4 = require('uuid/v4')
var Q = require('q')

var UserManager = function () {

}

UserManager.prototype.ensureDefaultUser = function () {
  User.find(function (error, userList) {

    //if there are no users, we need to create a default one
    if (userList.length == 0) {
      var newDefaultUser = new User()
      newDefaultUser.username = 'admin'
      newDefaultUser.password = uuidV4()
      newDefaultUser.type = User.USER_TYPE_DEFAULT

      newDefaultUser.save(function (err, savedUser) {
        if (err) {
          winston.error('Error saving new default user: %s', err)
        }
        else {
          winston.info('New default user saved with name: %s and password: ', savedUser.username, savedUser.password)
        }
      })
    } else {

      //if there is a default user, we need to print the password
      for (var i = 0; i < userList.length; i++) {
        var currentUser = userList[i];
        if (currentUser.type == User.USER_TYPE_DEFAULT) {
          winston.info("Default user found. Username: %s, password: %s", currentUser.username, currentUser.password)
        }
      }
    }

  })
}

UserManager.prototype.authenticate = function (username, password, callback) {

  var hashedPassword = password

  User.findOne({username: username, password: password}, function (error, foundUser) {

    //if we have user, we need to check password match.
    if (foundUser) {
      callback(foundUser)
    } else {
      callback(null)
    }
  })
}

UserManager.prototype.getUserDeferred = function (username) {
  var deferred = Q.defer()

  User.findOne({username: username}, function (error, foundUser) {
    deferred.resolve(foundUser)
  })

  return deferred.promise
}

UserManager.prototype.updatePassword = function (username, newPassword, callback) {
  User.findOne({username: username}, function (error, foundUser) {

    foundUser.password = newPassword
    foundUser.type = User.USER_TYPE_ACTIVATED
    foundUser.save(function (error, savedUser) {
      if (error) {
        winston.error('Error changing password on the user: %s Error: %s', username, error)
      }
      callback()
    })
  })
}

module.exports = new UserManager()