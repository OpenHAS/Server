var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Setting = new Schema({
  settingName : String,
  settingValue : String
})

var SettingModel = mongoose.model('Setting', Setting);

module.exports.Schema = Setting
module.exports.Model = SettingModel