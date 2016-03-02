$(document).ready(function(){
  var favouriteSwitch = $('.favouriteSwitch')
  var isEnabled = Boolean(favouriteSwitch.data('state'))
  favouriteSwitch.bootstrapSwitch('state',isEnabled,isEnabled)
})

