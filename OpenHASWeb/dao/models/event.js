var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Event = new Schema({
  timestamp : Date,
  source : String,
  parameters : [String]
})


Event.index({source: 1})
Event.index({timestamp: -1})

var EventModel = mongoose.model('Event', Event);

EventModel.on('index', function(error) {
  var errorMessage = "No error"
  if (error != undefined) {
    errorMessage = error
  }

  console.log('Indexes have been ensured on Event. Error: '+errorMessage)
});

module.exports.Schema = Event
module.exports.Model = EventModel