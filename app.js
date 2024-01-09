// URL
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Use D3 to fetch the JSON file
d3.json(url).then(function(data) {
  var dropdownMenu = d3.select("#selDataset");
  dropdownMenu.selectAll("option")
    .data(data.names)
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  // Call functions to build initial charts and metadata panel
  buildCharts(data.names[0]);
  buildMetadata(data.names[0]);
}).catch(function(error) {
  console.error(error);
});

// Define function to build charts
function buildCharts(subjectID) {
  // Fetch data for selected test subject
  d3.json(url).then(function(data) {
    var samples = data.samples.filter(function(sample) {
      return sample.id === subjectID;
    })[0];

    // Create bar chart
    var barTrace = {
      x: samples.sample_values.slice(0, 10).reverse(),
      y: samples.otu_ids.slice(0, 10).reverse().map(function(otuID) {
        return `OTU ${otuID}`;
      }),
      text: samples.otu_labels.slice(0, 10).reverse(),
      type: "bar",
      orientation: "h"
    };
    var barData = [barTrace];
    var barLayout = {
      yaxis: { title: "OTU ID" }
    };
    Plotly.newPlot("bar", barData, barLayout);

    // Create bubble chart
    var bubbleTrace = {
      x: samples.otu_ids,
      y: samples.sample_values,
      text: samples.otu_labels,
      mode: "markers",
      marker: {
        size: samples.sample_values,
        color: samples.otu_ids,
        colorscale: "Earth"
      }
    };
    var bubbleData = [bubbleTrace];
    var bubbleLayout = {
      xaxis: { title: "OTU ID" },
    };
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
  }).catch(function(error) {
    console.error(error);
  });
}

// Define function to build metadata panel
function buildMetadata(subjectID) {
  // Fetch metadata for selected test subject
  d3.json(url).then(function(data) {
    var metadata = data.metadata.filter(function(item) {
      return item.id === parseInt(subjectID);
    })[0];

    // Clear existing metadata
    var metadataPanel = d3.select("#sample-metadata");
    metadataPanel.html("");

    // Add new metadata to panel
    Object.entries(metadata).forEach(function([key, value]) {
      var row = metadataPanel.append("p");
      row.text(`${key}: ${value}`);
    });
  }).catch(function(error) {
    console.error(error);
  });
}

// Define function to build Gauge
function buildGauge(level) {
  var data = [    {      domain: { x: [0, 1], y: [0, 1] },
      value: level,
      title: { text: "Belly Button Washing Frequency" },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [0, 9], tickmode: "linear" },
        bar: { color: "#6B8E23" },
        steps: [
          { range: [0, 1], color: "#F8F3EC" },
          { range: [1, 2], color: "#F4F1E4" },
          { range: [2, 3], color: "#E9E6C9" },
          { range: [3, 4], color: "#E2E4B1" },
          { range: [4, 5], color: "#C7CC8F" },
          { range: [5, 6], color: "#B5B95C" },
          { range: [6, 7], color: "#8C9634" },
          { range: [7, 8], color: "#758026" },
          { range: [8, 9], color: "#5E6A1F" },
        ],
      },
    },
  ];

  var layout = { width: 500, height: 400, margin: { t: 0, b: 0 } };
  Plotly.react("gauge", data, layout);
}

// Call functions to update charts and metadata panel
function optionChanged(newSubject) {
  buildCharts(newSubject);
  buildMetadata(newSubject);
  var metadata = d3.json(url).then(function(data) {
    return data.metadata.filter(function(item) {
      return item.id === parseInt(newSubject);
    })[0];
  }).catch(function(error) {
    console.error(error);
  });
  metadata.then(function(result) {
    buildGauge(result.wfreq);
  });
}
