var USER_TYPE_UNKNOWN = 'unknown'
var USER_TYPE_DEFAULT = 'default'
var USER_TYPE_ACTIVATED = 'active'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var User = new Schema({
  username: String,
  password: String,
  type: {type: String, default: USER_TYPE_UNKNOWN}
})

var UserModel = mongoose.model('User', User);

UserModel.USER_TYPE_UNKNOWN = USER_TYPE_UNKNOWN
UserModel.USER_TYPE_DEFAULT = USER_TYPE_DEFAULT
UserModel.USER_TYPE_ACTIVATED = USER_TYPE_ACTIVATED

module.exports.Schema = User
module.exports.Model = UserModel