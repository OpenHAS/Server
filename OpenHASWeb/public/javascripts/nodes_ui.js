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
})

var fetchValue = function(nodeId) {
  console.log('get data for '+nodeId)

  var url = '/nodes/'+nodeId+'/value'
  $.getJSON(url,function(data){
    var selectorString = "span[id='"+ nodeId +"']"
    $(selectorString).text(data.result.value)
    $(selectorString).attr('title', data.result.timestamp)
  })
}

