var mongoose = require('mongoose')
var Setting = require('./models/setting').Model

var SettingsManager = function(){
  this.ManualOverrideKey = 'manualOverride'
  this.MosquittoUser = 'mosquittoUser'
  this.MosquittoPassword = 'mosquittoPassword'
}

SettingsManager.prototype.setValue = function(key, value, callback) {
  Setting.findOne({settingName:key}, function(err, setting) {
    if(setting) {
      setting.settingValue = value
      setting.save(callback)
    } else {

      var newSetting = new Setting()
      newSetting.settingName = key
      newSetting.settingValue = value

      newSetting.save(function(err, savedSetting){
        callback(err, savedSetting)
      })
    }
  })
}

SettingsManager.prototype.getValue = function(key, defaultValue, callback) {
  Setting.findOne({settingName: key}, function(err, setting){

    if (setting) {
      callback(setting.settingValue)
    } else {
      callback(defaultValue)
    }
  })
}


module.exports = new SettingsManager()