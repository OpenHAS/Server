var mongoose = require('mongoose')
var Setting = require('./models/setting').Model
var Q = require('q')

var SettingsManager = function(){
  this.ManualOverrideKey = 'manualOverride'
  this.MosquittoUser = 'mosquittoUser'
  this.MosquittoPassword = 'mosquittoPassword'
  this.ApiToken = 'apiToken'
  this.ApiEnabled = 'api_enabled'
  this.AnonymousDashboardAccess = 'anonymous_dashboard_access'
  this.SlackToken = 'slack_token'
  this.ParticleUsername = 'particleUser'
  this.ParticlePassword = 'particlePassword'
  this.SensorMapEnabled = 'sensor_map_enabled'
  this.ParticleSecurityToken = 'ParticleSecurityToken'
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


SettingsManager.prototype.getValueDeferred = function(key, defaultValue) {

  var deferred = Q.defer()

  this.getValue(key,defaultValue,function(readValue){
    deferred.resolve(readValue)
  })

  return deferred.promise
}

module.exports = new SettingsManager()
