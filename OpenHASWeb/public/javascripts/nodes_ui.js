$(document).ready(function(){
  var nodePanels = $('.nodeElement')

  nodePanels.each(function(){

    //get the variables
    var nodePanel = $(this)
    var refreshRate = nodePanel.attr('data-refreshRate')
    var nodeId = nodePanel.attr('data-nodeId')

    //register a timer for every node
    setInterval(fetchValue, refreshRate * 1000, nodeId)

    //do an immediate fetch
    fetchValue(nodeId)
  })

  //also need to find switches
  var outputSwitches = $('.actuatorSwitch')

  outputSwitches.each(function(){

    var sw = $(this)
    var isEnabled = Boolean(sw.data('state'))

   //sw.bootstrapSwitch('state',isEnabled,isEnabled)

    sw.on('switchChange.bootstrapSwitch', function(event, state) {
      var url = '/nodes/'+sw.attr('name')+'/setOutputState'
      $.post(url,{'state':state})
    });
  })
})

var fetchValue = function(nodeId) {
  console.log('get data for '+nodeId)

  var url = '/nodes/'+nodeId+'/value'
  $.getJSON(url,function(data){

    console.log('data for node: %s data: %s', nodeId, JSON.stringify(data.result))

    var selectorString = "span[id='"+ nodeId +"']"
    $(selectorString).text(data.result.value)

    var selectorString = "input[name='"+ nodeId +"']"
    var switchValue = data.result.value == "1"
    $(selectorString).bootstrapSwitch('state',switchValue)

    $(selectorString).attr('title', data.result.timestamp)
  })
}

