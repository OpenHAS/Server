$(document).ready(function(){
  var ruleEnabledSwitches = $('#ruleEnabled')

  ruleEnabledSwitches.each(function(){

    //make it a switch
    var sw = $(this)
    var isEnabled = Boolean(sw.data('state'))

    sw.bootstrapSwitch('state',isEnabled,isEnabled)

    //set initial state

   // sw.setState(isEnabled)
    console.log('Setting state to %s on %s', isEnabled, sw.attr('name'))

    sw.on('switchChange.bootstrapSwitch', function(event, state) {
      var url = '/rules/'+sw.attr('name')+'/updateState'
      $.post(url,{'state':state})
    });

  })
})

