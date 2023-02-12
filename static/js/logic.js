// Define function to create map layers and display them
function createMap(eqs, plates) {

    // Base map layer
    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Topographic map layer
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var watercolor = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>)'
    })

    // Map layers
    var baseMaps = {
        "Base Map": base,
        "<span style='color: seagreen'>Topographical Map</span>": topo,
        "<span style='color: darkturquoise'>Watercolor</span>": watercolor
    };    

    // Overlays
    var overlayMaps = {
        "Earthquakes": eqs,
        "Tectonic Plates": plates
    };

    // Map object
    var myMap = L.map("map", {
        center: [0, 30],
        zoom: 3,
        layers: [base, plates, eqs]
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

        // Add legend title
        div.innerHTML += '<center><h2>Earthquake<br>Depth (km)</h2><hr></center>'
        
        // Add a new colored entry to the legend for each item
        // in the 'levels' array & return the div when complete
        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        };
        return div;
    };

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
    };
};

// Define function to create markers based on JSON response objects
function createMarkers(response1, response2) {

    // Define function to draw circle markers
    function ptToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            color: 'black',
            weight: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.6,
            radius: feature.properties.mag ** 1.5
        });
    };

    // Define function to attach popup messages
    function onEach(feature, layer) {
        layer.bindPopup(`<h2>${feature.properties.place}</h2><h3>
            Magnitude: ${feature.properties.mag} - 
            Depth: ${feature.geometry.coordinates[2]}km</h3><hr>
            <p>${new Date(feature.properties.time)}</p>`);
        ptToLayer(feature, [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
    };

    // Create geoJSON layer for earthquake data
    var gJsonLayer = L.geoJSON(response1.features, {
        onEachFeature: onEach,
        pointToLayer: ptToLayer
    });

    // Create geoJSON layer for tectonic plates
    var gJsonLayer2 = L.geoJSON(response2.features, {
        style: {
            color: 'teal',
            weight: 2
        }
    });

    // Create map with geoJSON layer
    createMap(gJsonLayer, gJsonLayer2);
};

// URL to get Earthquake data from USGS.gov site
// Getting info on earthquakes 4.5 and above from the last month
var quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

// URL to get tectonic plate data from Hugo Ahlenius, Nordpil and Peter Bird GitHub page
var plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// DataPromise to get geoJSON data from urls, then call functions to create the markers & map
Promise.all([d3.json(quakeUrl), d3.json(plateUrl)]).then(function([data1, data2]){
    createMarkers(data1, data2);
});
