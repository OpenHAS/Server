var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Event = new Schema({
  timestamp : Date,
  source : String,
  parameters : [String]

})

var EventModel = mongoose.model('Event', Event);

module.exports.Schema = Event
module.exports.Model = EventModel