# Belly Button Biodiversity
### Interactive dashboard to explore the [Belly Button Biodiversity DataSet.](robdunnlab.com/projects/belly-button-biodiversity/)

#### Used Plotly to create:
1. Interactive **PIE** chart that uses data from sample route (/samples/<samples>) to display top 10 samples.
  * sample_values as the values for the PIE chart
  * otu_ids as the labels for the pie chart
  * otu_labels as the hovertext for the chart
2. __Bubble__ Chart that uses data from your samples route (/samples/<sample>) to display each sample.
  * otu_ids for the x values
  * sample_values for the y values
  * sample_values for the marker size
  * otu_ids for the marker colors
  * otu_labels for the text values
  
#### Hosted on Heroku:
* [Heroku App URL.](https://bbuttonplotly-api-heroku.herokuapp.com/)
