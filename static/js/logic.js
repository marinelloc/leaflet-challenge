function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map.
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });


  // Create a baseMaps object to hold the streetmap layer.
  let baseMaps = {
    "Street Map": streetmap
  };

  // Create the map object with options.
  let map = L.map("map-id", {
    center: [39.50, -98.35],
    zoom: 3.5,
    layers: [streetmap]
  });

  // Create a layer control, and pass it baseMaps. Add the layer control to the map.
  L.control.layers(baseMaps).addTo(map);

  // Add earthquake data to the map
  earthquakes.addTo(map);

  // Add legend
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = '#fff'; // Set background color to white
    let labels = ['<strong>Depth (%)</strong>'];

    // Define colors corresponding to each quartile
    let colors = [
      chroma.scale(['green', 'yellow', 'orange', 'red']).domain([0, 25, 50, 100])(0).hex(),
      chroma.scale(['green', 'yellow', 'orange', 'red']).domain([0, 25, 50, 100])(25).hex(),
      chroma.scale(['green', 'yellow', 'orange', 'red']).domain([0, 25, 50, 100])(50).hex(),
      chroma.scale(['green', 'yellow', 'orange', 'red']).domain([0, 25, 50, 100])(100).hex()
    ];

    // Add legend content
    labels.push('<div style="background-color: ' + colors[0] + '; color: black;">0 - 25</div>');
    labels.push('<div style="background-color: ' + colors[1] + '; color: black;">25 - 50</div>');
    labels.push('<div style="background-color: ' + colors[2] + '; color: black;">50 - 100</div>');
    labels.push('<div style="background-color: ' + colors[3] + '; color: black;">100+</div>');

    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);



}

function createMarkers(response) {

  // Pull the "features" property from response.
  let features = response.features;

  // Initialize an array to hold the earthquake markers.
  let quakeMarkers = [];

  // Define color scale from green to red for earthquake depth
  let colorScale = chroma.scale(['green', 'yellow', 'orange', 'red']).domain([0, 25, 75, 100]); 

  // Loop through the features array.
  for (let index = 0; index < features.length; index++) {
    let feature = features[index];

    // Define marker size based on earthquake magnitude
    let size = feature.properties.mag * 5;

    // Define marker color based on earthquake depth
    let depthColor = colorScale(feature.geometry.coordinates[2]).hex()

    // For each feature, create a circle marker, and bind a popup with the earthquake's information.
    let quakeMarker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      radius: size,
      fillColor: depthColor,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup("<h3>" + feature.properties.place + "<h3><h3>Magnitude: " + feature.properties.mag + "</h3>");

    // Add the marker to the quakeMarkers array.
    quakeMarkers.push(quakeMarker);
  }

  // Create a layer group from the quakeMarkers array, and pass it to the createMap function.
  createMap(L.layerGroup(quakeMarkers));
}

// Perform an API call to get the earthquake information. Call createMarkers when it completes.
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(createMarkers);
