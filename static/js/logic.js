function createMap(eqs) {
    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var baseMaps = {
        "Base Map": baseMaps,
        "Topographical Map": topo
    };

    var overlayMaps = {
        "Earthquakes": eqs
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [base, eqs]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);
};


function createMarkers(response) {

    var quakes = response.features;
    var quakeMarkers = [];

    for (var index = 0; index < quakes.length; index++) {
        var quake = quakes[index]

        var quakemark = L.marker([quake.geometry.coordinates[1], quake.geometry.coordinates[0]])
        .bindPopup('hi');

        quakeMarkers.push(quakemark);
    }
    console.log(quakeMarkers);
    createMap(L.layerGroup(quakeMarkers));
}

var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

d3.json(url).then(function(data){
    console.log(data);
    createMarkers(data);
});