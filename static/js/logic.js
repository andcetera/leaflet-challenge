// Define function to create map layers and display them
function createMap(eqs, plates, t, tc) {

    // Base map layer
    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Topographic map layer
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Watercolor map layer
    var watercolor = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>)'
    })

    // Satalite map layer
    var sat = L.tileLayer('https://core-sat.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}&scale=1&lang=ru_RU', {
        attribution: '<a href="https://yandex.ru" target="_blank">Yandex</a>'
      });

    // Map layers
    var baseMaps = {
        "<span style='color: olive'>Street Map</span>": base,
        "<span style='color: olive'>Topographical Map</span>": topo,
        "<span style='color: olive'>Watercolor Map</span>": watercolor,
        "<span style='color: olive'>Satalite Map</span>": sat
    };    

    // Overlays
    var overlayMaps = {
        "<span style='color: olive'>Tectonic Plates</span>": plates,
        "<span style='color: olive'>Earthquakes Above 4.5<br>Magnitude in the Past 30 Days</span>": eqs
    };

    // Map object
    var myMap = L.map("map", {
        center: [0, 30],
        zoom: 3,
        layers: [base, eqs]
    });

    // Control panel
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    tc.addTo(myMap);
    tc.addTimelines(t);
    t.addTo(myMap);

    // Create legend object
    var legend = L.control({position: 'bottomright'});

    // Create the labels for the legend
    legend.onAdd = function(){

        // Create the legend div
        var div = L.DomUtil.create('div', 'info legend'),
            levels = [0, 50, 100, 200, 500],
            labels = [];

        // Add legend title
        div.innerHTML += '<center><h2>Earthquake<br>Depth</h2><hr></center>'
        
        // Add a new colored entry to the legend for each item
        // in the 'levels' array & return the div when complete
        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + ' km<br>' : ' km +');
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
        return '#bd0026';
    } else if (depth > 200){
        return '#f03b20'
    } else if(depth > 100) {
        return '#fd8d3c'
    } else if (depth > 50) {
        return '#fecc5c'
    } else {
        return '#ffffb2'
    };
};

// Define function to create markers based on JSON response objects
function createMarkers(response1, response2) {

    // Define function to draw circle markers
    function ptToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            color: 'olive',
            weight: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.7,
            radius: feature.properties.mag ** 1.5,
        });
    };

    // Define function to attach popup messages
    function onEach(feature, layer) {
        layer.bindPopup(`<h2>${feature.properties.place}</h2><h3>
            Magnitude: ${feature.properties.mag} - 
            Depth: ${feature.geometry.coordinates[2]}km</h3><hr>
            <p>${new Date(feature.properties.time)}</p>`);

        // Open popups on mouse hover 
        layer.on('mouseover', function(d){
            this.openPopup();
        });
        layer.on('mouseout', function(e){
            this.closePopup();
        });
    };

    // Create geoJSON layer for earthquake data
    var gJsonLayer = L.geoJSON(response1.features, {
        onEachFeature: onEach,
        pointToLayer: ptToLayer
    });

    // Create geoJSON layer for tectonic plates
    var gJsonLayer2 = L.geoJSON(response2.features, {
        style: {
            color: 'dodgerblue',
            weight: 2
        }
    });




    var getInterval = function(quake) {
        return {
            start: quake.properties.time,
            end: quake.properties.time + quake.properties.mag * 1800000,
        };
    };

    var timelineControl = L.timelineSliderControl({
        formatOutput: function(date) {
            return new Date(date).toString();
        },
    });

    var timeline = L.timeline(response1, {
        getInterval: getInterval,
        onEachFeature: onEach,
        pointToLayer: ptToLayer
    });






    // Create map with geoJSON layer
    createMap(gJsonLayer, gJsonLayer2, timeline, timelineControl);
};



function eqfeed_callback(data) {

    var getInterval = function(quake) {
        return {
            start: quake.properties.time,
            end: quake.properties.time + quake.properties.mag * 1800000,
        };
    };

    var timelineControl = L.timelineSliderControl({
        formatOutput: function(date) {
            return new Date(date).toString();
        },
    });

    var timeline = L.timeline(response1, {
        getInterval: getInterval,
        onEachFeature: onEach,
        pointToLayer: ptToLayer
    });

    timelineControl.addTo(map);
    timelineControl.addTimelines(timeline);
    timeline.addTo(map);

}



// URL to get Earthquake data from USGS.gov site
// Getting info on earthquakes 4.5 and above from the last month
var quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

// URL to get tectonic plate data from Hugo Ahlenius, Nordpil and Peter Bird GitHub page
var plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// DataPromise to get geoJSON data from urls, then call functions to create the markers & map
Promise.all([d3.json(quakeUrl), d3.json(plateUrl)]).then(function([data1, data2]){
    createMarkers(data1, data2);
});
