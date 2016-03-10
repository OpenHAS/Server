var User = require('./models/user').Model
var winston = require('winston')

var UserManager = function() {

}

UserManager.prototype.authenticate = function(username, password, callback) {

  var hashedPassword = password

  User.findOne({username:username},function(error, foundUser){

    //if we have user, we need to check password match.
    if(foundUser){
      if (foundUser.password == password) {
        callback(foundUser)
      } else {
        callback(null)
      }
    } else {
      //if we dont have the user, we might need to create it
      if (process.env.NEW_PASSWORD!=null && process.env.NEW_USER!=null){

        var newUser = new User()
        newUser.username = process.env.NEW_USER
        newUser.password = process.env.NEW_PASSWORD

        newUser.save( function(err,savedUser){
          if (err) {
            winston.error('Error saving new user: %s', err)
            callback(null)
          }
          else {
            winston.info('New user saved with name:%s', savedUser.username)
            callback(savedUser)
          }
        })
      } else {
        callback(null)
      }
    }
  })
}

module.exports = new UserManager()