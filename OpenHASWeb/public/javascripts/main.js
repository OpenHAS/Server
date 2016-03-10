$(document).ready(function(){
  var manSwitch = $('.manualSwitch')

  var url = '/settings/manualOverride/value'
  manSwitch.on('switchChange.bootstrapSwitch', function(event, state) {
    $.post(url,{'value':state})
  });

  $.getJSON(url,{default:false},function(data){

    var state = data.result == 'true'
    manSwitch.bootstrapSwitch('state',state,true)
  })

})
