var mongoose = require('mongoose')
var Schema = mongoose.Schema

var User = new Schema({
  username : String,
  password : String
})

var UserModel = mongoose.model('User', User);

module.exports.Schema = User
module.exports.Model = UserModel