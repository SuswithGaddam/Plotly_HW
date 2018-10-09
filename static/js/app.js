function init() {
  getSamples();
}

//Initialize the dashboard
init();

//Gets the available sample values
function getSamples() {
  //Grab the reference to the dropdown select element
  var selDataset = document.getElementById('selDataset');
  //Use the list of sample names to populate the select sample
  Plotly.d3.json('/names', function (error, samplenames) {
      for (var i = 0; i < samplenames.length; i++) {
          var option = document.createElement('option');
          option.text = samplenames[i];
          option.value = samplenames[i];
          selDataset.appendChild(option)
      }
      getData(samplenames[0], buildCharts);
  })
}

//Function to get the sample data from the routes - sample/sample and 'otu'
function getData(sample, callback) {

  Plotly.d3.json('/samples/'+sample, function (error, sampleData) {
      if (error) return console.warn(error);
      console.log("At get data")
      Plotly.d3.json('/otu', function (error, otuData) {
          console.log('otuData',otuData)
          if (error) return console.warn(error);
          callback(sampleData, otuData);
      });
  });
  Plotly.d3.json('/metadata/'+sample, function(error, metaData) {
      if (error) return console.warn(error);
      console.log('At metadata')
      updateMetaData(newData);
  });
}

//Function to initiate the updation process
function optionChanged(newSample){
  getData(newSample, updateCharts);
}
//Function to build the basic charts when the page loads
function buildCharts(sampleData, otuData) {

  //Loop through sample data and find the OTU Taxonomic Name
  var labels = sampleData[0]['otu_ids'].map(function (item) {
      return otuData[item]
  });
  //Build PIE Chart
  console.log("At charts")

  var piedata = [{

      values: sampleData[0]['sample_values'].slice(0, 10),
      labels: sampleData[0]['otu_ids'].slice(0, 10),
      hovertext: labels.slice(0, 10),
      hoverinfo: 'hovertext',
      type: 'pie'
  }];

  var pielayout = { height:400, width:400 };

  var PIE = document.getElementById('pie_chart');
  Plotly.plot(PIE, piedata, pielayout);

  // Build Bubble Chart

  var bubbleData = [{
      x: sampleData[0]['otu_ids'],
      y: sampleData[0]['sample_values'],
      text: labels,
      mode: 'markers',
      marker: {
          size: sampleData[0]['sample_values'],
          color: sampleData[0]['otu_ids'],
          colorscale: "Earth",
      }
  }];

  var bubbleLayout = { height:600, width:1200, hovermode: 'closest', xaxis: { title: 'OTU ID' } };
  var BUBBLE = document.getElementById('bubble');
  Plotly.plot(BUBBLE, bubbleData, bubbleLayout);
}

//Function to update the charts based on the sample selection
function updateCharts(sampleData, otuData) {

  
  var sampleValues = sampleData[0]['sample_values'];
  var otuIDs = sampleData[0]['otu_ids'];
  // Return the OTU Description for each otuID in the dataset
  var labels = otuIDs.map(function(item) {
      return otuData[item]
  });
    
  // Update the Bubble Chart with the new data
  var BUBBLE = document.getElementById('bubble');
  Plotly.restyle(BUBBLE, 'x', [otuIDs]);
  Plotly.restyle(BUBBLE, 'y', [sampleValues]);
  Plotly.restyle(BUBBLE, 'text', [labels]);
  Plotly.restyle(BUBBLE, 'marker.size', [sampleValues]);
  Plotly.restyle(BUBBLE, 'marker.color', [otuIDs]);
  
  // Update the Pie Chart with the new data
  var PIE = document.getElementById('pie_chart');
  var pieUpdate = {
      values: [sampleValues.slice(0, 10)], 
      labels: [otuIDs.slice(0, 10)],
      hovertext: [labels.slice(0, 10)],
      hoverinfo: 'hovertext',
      type: 'pie'
  };
  
  Plotly.restyle(PIE, pieUpdate);
  
}

// Create a function to update the Sample Meta Data 
function updateMetaData(data) {
  // Reference to Panel element for sample metadata
  var PANEL = document.getElementById("sample-MetaData");
  // Clear any existing metadata
  PANEL.innerHTML = '';
  // Loop through all of the keys in the json response and
  // create new metadata tags
  for(var key in data) {
      h6tag = document.createElement("h6");
      h6Text = document.createTextNode(`${key}: ${data[key]}`);
      h6tag.append(h6Text);
      PANEL.appendChild(h6tag);
  }  
}