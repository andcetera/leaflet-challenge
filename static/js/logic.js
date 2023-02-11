// Define function to create map layers and display them
function createMap(eqs) {

    // Base map layer
    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Topographic map layer
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Map layers
    var baseMaps = {
        "Base Map": base,
        "<span style='color: green'>Topographical Map</span>": topo
    };

    // Overlays
    var overlayMaps = {
        "Earthquakes": eqs
    };

    // Map object
    var myMap = L.map("map", {
        center: [0, 30],
        zoom: 3,
        layers: [base, eqs]
    });

    // Control panel
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Create legend object
    var legend = L.control({position: 'bottomright'});

    // Create the labels for the legend
    legend.onAdd = function(){

        // Create the legend div
        var div = L.DomUtil.create('div', 'info legend'),
            levels = [0, 50, 100, 200, 500],
            labels = [];

        // Add a title
        div.innerHTML += '<center><h2>Earthquake<br>Depth (km)</h2><hr></center>'
        
        // Add a new colored entry to the legend for each item
        // in the 'levels' array & return the div when complete
        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        }
        return div;
    }

    // Add the legend to the map
    legend.addTo(myMap);
};

// Define function to assign colors based on earthquake depth
function getColor(depth){
    
    // Deeper depths get darker colors
    if (depth > 500){
        return '#253494';
    } else if (depth > 200){
        return '#2c7fb8'
    } else if(depth > 100) {
        return '#41b6c4'
    } else if (depth > 50) {
        return '#a1dab4'
    } else {
        return '#ffffcc'
    }
};

// Define function to create markers based on JSON response object
function createMarkers(response) {

    // Save response object to a variable
    var quakes = response.features;

    // Save an empty array to push completed markers to
    var markers = [];

    // Iterate through response objects to create markers
    for (var i = 0; i < quakes.length; i++) {

        // Variables for each item in the features we are interested in
        var quake = quakes[i];
        var date = new Date(quake.properties.time);
        var magnitude = quake.properties.mag;
        var location = [quake.geometry.coordinates[1], quake.geometry.coordinates[0]];
        var place = quake.properties.place;
        var depth = depth = quake.geometry.coordinates[2];

        // Create marker
        var marker = L.circle(location, {
            color: 'black',
            weight: 1,
            fillColor: getColor(depth),
            fillOpacity: 0.6,
            radius: magnitude * 50_000
        }).bindPopup(`<h2>${place}</h2><h3>Magnitude: ${magnitude} - Depth: ${depth}km</h3><hr><p>${date}</p>`);

        // Push marker to array
        markers.push(marker);
    }

    // Create marker layer & pass it to the createMap function
    createMap(L.layerGroup(markers));
};

// URL to get Earthquake data from USGS.gov site
// Getting info on earthquakes 4.5 and above from the last month
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

// Data Promise to get JSON from url, then call createMarkers function
d3.json(url).then(createMarkers);