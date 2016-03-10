var TemperatureSensor = function() {
  this.name = "OHTemperatureSensor"
  this.getters = ["getTemperature"]
  this.setters = []
}

TemperatureSensor.prototype.getTemperature = function(event) {
 return Number(event.parameters[1])
}

var DoubleRelayActuator = function() {
  this.name = "OHDoubleRelayActuator"
  this.getters = ["getRelay1State", "getRelay2State"]
  this.setters = ["setRelay1State", "setRelay2State"]
}

DoubleRelayActuator.prototype.getRelay1State = function(event) {
  return event.parameters[1] == "1"
}

DoubleRelayActuator.prototype.getRelay2State = function(event) {
  return event.parameters[3] == "1"
}

DoubleRelayActuator.prototype.setRelay1State = function(state) {
  return "SetRelayState,0,"+Number(state)
}

DoubleRelayActuator.prototype.setRelay2State = function(state) {
  return "SetRelayState,1,"+Number(state)
}

module.exports = [new TemperatureSensor(), new DoubleRelayActuator()]