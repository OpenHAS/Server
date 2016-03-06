$(document).ready(function(){

  //create an array from node ids
  var nodeIDs = viewModel.nodes.map(function(currentNode){
    return currentNode._id.toString()
  })

  //register a timer for every node
  setInterval(fetchValues, 10*1000, nodeIDs)

  //also need to find switches
  var outputSwitches = $('.actuatorSwitch')

  outputSwitches.each(function(){

    var sw = $(this)
    var isEnabled = Boolean(sw.data('state'))
    sw.attr('data-lastchange','2000.01.01 00:00:00')

   //sw.bootstrapSwitch('state',isEnabled,isEnabled)

    sw.on('switchChange.bootstrapSwitch', function(event, state) {
      var url = '/nodes/'+sw.attr('name')+'/setValue'
      var v = Number(state)

      //save the last change date
      sw.attr('data-lastchange', new Date())

      $.post(url,{'value':v})
    });
  })

  //do an immediate fetch
  fetchValues(nodeIDs)
})

var fetchValues = function(nodeIds) {

  nodeIds.forEach(function(currentNodeId){
    fetchValue(currentNodeId)
  })
}

var fetchValue = function(nodeId) {
  console.log('get data for '+nodeId)

  var url = '/nodes/'+nodeId+'/value'
  $.getJSON(url,function(data){

    console.log('data for node: %s data: %s', nodeId, JSON.stringify(data.result))

    var selectorString = "span[id='"+ nodeId +"']"
    $(selectorString).text(data.result.value)

    var selectorString = "input[name='"+ nodeId +"']"
    var switchValue = data.result.value == "1"
    var sw = $(selectorString)

    var lastChangeDate = new Date(sw.attr('data-lastchange'))
    var receivedDataTimestamp = new Date(data.result.timestamp)

    var deltaMilis = receivedDataTimestamp.getTime()-lastChangeDate.getTime()
    console.log('Delta: %d', deltaMilis)
    if (deltaMilis > 5000) {
      sw.bootstrapSwitch('state',switchValue, true)
    } else {
      console.log('Not changing switch, reveived data is older than change')
    }

    $(selectorString).attr('title', data.result.timestamp)
  })
}

