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

  var url = '/nodes/'+nodeId+'/value'
  $.getJSON(url,function(data){

    console.log('Data %s', JSON.stringify(data.result))

    //set labels
    var selectorString = "span[id='"+ nodeId +"']"
    var spans = $(selectorString)

    if (spans.length > 0) {
      spans.text(data.result.value)
      spans.attr('title', data.result.timestamp)
    }

    //set switches
    var selectorString = "input[name='"+ nodeId +"']"
    var sw = $(selectorString)

    if (sw.length > 0) {
      var switchValue = data.result.value == "1"
      var lastChangeDate = new Date(sw.attr('data-lastchange'))
      var receivedDataTimestamp = new Date(data.result.timestamp)

      var deltaMilis = receivedDataTimestamp.getTime() - lastChangeDate.getTime()

      if (deltaMilis > 5000) {
        sw.bootstrapSwitch('state', switchValue, true)
      } else {
        console.log('Not changing switch, reveived data is older than change')
      }
    }
  })
}

