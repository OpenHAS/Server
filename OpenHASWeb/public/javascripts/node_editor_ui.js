$(document).ready(function(){
  var favouriteSwitch = $('.favouriteSwitch')
  var isEnabled = Boolean(favouriteSwitch.data('state'))
  favouriteSwitch.bootstrapSwitch('state',isEnabled,isEnabled)

  var nodeTypeSelects = $('select')

  nodeTypeSelects.each(function(){
    var select = $(this)
    var val = select.attr('data-value')
    select.val(val)

  })
})

