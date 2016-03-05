$(document).ready(function(){
  var favouriteSwitch = $('.favouriteSwitch')
  var isEnabled = Boolean(favouriteSwitch.data('state'))
  favouriteSwitch.bootstrapSwitch('state',isEnabled,isEnabled)

  var nodeTypeSelect = $("select[name='nodeType']")
  var val = nodeTypeSelect.attr('data-value')
  nodeTypeSelect.val(val)

  nodeTypeSelect.change(populateDropdowns)

  populateDropdowns()

  selectGetterSetter()
})

var populateGetterDropdown = function(){

  var getterSelect = $("select[name='getterFunction']")

  getterSelect.empty()

  var currentNodeType = viewModel.nodeTypes.filter(function(elem){
    return elem.name == $("select[name='nodeType']").val()
  })[0]

  currentNodeType.getters.forEach(function(currentGetter){
    var op = $('<option>').val(currentGetter).text(currentGetter)
    getterSelect.append(op)
  })
}

var populateSetterDropdown = function() {

  var setterSelect = $("select[name='setterFunction']")

  setterSelect.empty()

  var currentNodeType = viewModel.nodeTypes.filter(function(elem){
    return elem.name == $("select[name='nodeType']").val()
  })[0]

  currentNodeType.setters.forEach(function(currentGetter){
    var op = $('<option>').val(currentGetter).text(currentGetter)
    setterSelect.append(op)
  })

}

var populateDropdowns = function() {
  populateGetterDropdown()
  populateSetterDropdown()
}

var selectGetterSetter = function() {

  //select the saved value in the getter/setter dropdown

  var getterSelect = $("select[name='getterFunction']")
  var val = getterSelect.attr('data-value')
  getterSelect.val(val)

  var setterSelect = $("select[name='setterFunction']")
  val = setterSelect.attr('data-value')
  setterSelect.val(val)

}