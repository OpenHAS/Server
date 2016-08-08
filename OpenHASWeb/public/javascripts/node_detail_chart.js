// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('datetime', 'Date');
  data.addColumn('number', 'Temperature');
  for (var i = 0; i < viewModel.events.length; i++) {
    var currentEvent = viewModel.events[i];
    data.addRow([new Date(currentEvent.timestamp), currentEvent.value])
  }

  var legend = {
    'position' : 'none'
  }



  // Set chart options
  var options = {
    'curveType': 'function',
    'height':400,
    'legend' : legend,
    'chartArea' : {left:70,top:20,width:'90%',height:'90%'}
  }


  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}