$(document).ready(function(){
  var manSwitch = $('.manualSwitch')
  var isEnabled = Boolean(manSwitch.data('state'))
  manSwitch.bootstrapSwitch('state',isEnabled,isEnabled)
})
