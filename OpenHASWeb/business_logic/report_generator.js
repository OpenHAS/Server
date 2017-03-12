var winston = require('winston')
var nodeManager = require('../dao/node_manager')
var async = require('async')
var Table = require('easy-table')
var Helper = require('./helper')

var IntegrationModel = function (limit) {
  this.total = 0
  this.count = 0
  this.lastTimestamp = 0
  this.timespan = limit
}

var ReportGenerator = function () {

  //schedule the generator to run
  var interval = 60 * 60 * 1000 //every hour
  setInterval(this.execute.bind(this),interval)
  winston.info('Report generation scheduled for every %s second', interval/1000)

  this.limit7Day = 15 * 60 * 1000 //15 minutes integration window for 7 days
  this.limit30Day = 6 * 60 * 60 * 1000 //6 hours integration window for 30 days
  this.limit365Day = 24 * 60 * 60 * 1000 //24 hours integration window for 365 days

  this.integration7Day = new IntegrationModel(this.limit7Day)
  this.integration30Day = new IntegrationModel(this.limit30Day)
  this.integration365Day = new IntegrationModel(this.limit365Day)

  this.report = {}
}

ReportGenerator.prototype.execute = function() {
  winston.info('Report generation started')
  var self = this


  //first step is to load the nodes
  nodeManager.nodes(function (nodeList) {

    winston.info('Need to generate report for %s nodes', nodeList.length)

    var now = new Date()

    var startDate = now
    startDate.setDate(startDate.getDate()-365)

    var startDate7Days = new Date()
    startDate7Days.setDate(startDate7Days.getDate()-7)

    var startDate30Days = new Date()
    startDate30Days.setDate(startDate30Days.getDate()-30)

    async.each(nodeList,function (currentNode, callback) {

      winston.info('Loading events for node: %s', currentNode.nodeName)
      nodeManager.getNodeValuesById(currentNode._id, startDate, function (result, error) {
        winston.info('Got %s events for node: %s', result.events.length, result.node.nodeName)

        //iterate over the results calculate the averages
        nodeReport = {}
        nodeReport.node = result.node
        nodeReport.allEventsCount = result.events.length
        nodeReport.last7Days = []
        nodeReport.last30Days = []
        nodeReport.last365Days = []

        if (result && result.events && result.events.length > 0) {

          self.integration7Day.lastTimestamp = result.events[0].timestamp.getTime()
          self.integration30Day.lastTimestamp = result.events[0].timestamp.getTime()
          self.integration365Day.lastTimestamp = result.events[0].timestamp.getTime()

          for (var j = 0; j < result.events.length; j++) {
            var currentEvent = result.events[j];

            //if the value can be processed
            if ( Helper.isNumeric(currentEvent.value) ) {

              var forceIntegrate = j == result.events.length-1 // for the last element we force the integration

              if(currentEvent.timestamp.getTime() > startDate7Days.getTime() ) {
                self.checkIntegralCondition(currentEvent, self.integration7Day, nodeReport.last7Days, forceIntegrate)
              }

              if(currentEvent.timestamp.getTime() > startDate30Days.getTime() ) {
                self.checkIntegralCondition(currentEvent, self.integration30Day, nodeReport.last30Days, forceIntegrate)
              }

              self.checkIntegralCondition(currentEvent, self.integration365Day, nodeReport.last365Days, forceIntegrate)
            }
          }

          winston.info('Finished processing the events for node: %s', result.node.nodeName)
          self.report[result.node._id] = nodeReport
          callback()
        }
      })


    }, function (error) {
      winston.info('Calculation finished for every node.')
      var t = new Table()
      for (var key in self.report) {
        if (self.report.hasOwnProperty(key)) {

          var nodeReport = self.report[key];
          t.cell('Node', nodeReport.node.nodeName)
          t.cell('Last 7', nodeReport.last7Days.length)
          t.cell('Last 30', nodeReport.last30Days.length)
          t.cell('Last 365', nodeReport.last365Days.length)
          t.cell('All', nodeReport.allEventsCount)
          t.newRow()
        }
      }

      t.sort(['Node'])

      winston.info("\n"+t.toString())

    })
  })
}

ReportGenerator.prototype.checkIntegralCondition = function(currentEvent, integrationModel, holderArray, forceIntegrate) {

  //we add it to the variables
  integrationModel.total += currentEvent.value
  integrationModel.count ++

  //if integration is forced, we do it regardless of the time difference. Its used for having the last non-complete integration window in the list as well.
  if (forceIntegrate) {
    this.calculateIntegral(currentEvent, integrationModel, holderArray)
  } else {

    var diff = Math.abs(integrationModel.lastTimestamp - currentEvent.timestamp.getTime())

    if (diff >= integrationModel.timespan) {

      //if the difference is bigger than the 365 day integration period, we do the avg calculation
      this.calculateIntegral(currentEvent, integrationModel, holderArray)
    }
  }
}

ReportGenerator.prototype.calculateIntegral = function (currentEvent, integrationModel, holderArray) {

  var sample = {}
  sample.value = integrationModel.total / integrationModel.count
  sample.timestamp = currentEvent.timestamp

  integrationModel.total = 0
  integrationModel.count = 0
  integrationModel.lastTimestamp = currentEvent.timestamp.getTime()

  holderArray.push(sample)
}

module.exports = new ReportGenerator()