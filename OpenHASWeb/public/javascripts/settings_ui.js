$(document).ready(function () {

  var switches = $('input.switch')

  switches.each(function(){
    var sw = $(this)

    var isEnabled = Boolean(sw.data('state'))
    sw.bootstrapSwitch('state', isEnabled, true)
    sw.on('switchChange.bootstrapSwitch', function (event, state) {
      
      var url = '/settings/'+sw.attr('name')+'/value'
      $.post(url, {'value': state})
    })
  })
})

function regenerate_api_token() {

  $.post('/settings/regenerate_api_token', function (response) {
    $('input[name="api_token"]').val(response.api_token)
  })
}

function regenerate_particle_token() {
  $.post('/settings/regenerate_particle_token', function (response) {
    $('input[name="particle_token"]').val(response.particle_token)
  })
}