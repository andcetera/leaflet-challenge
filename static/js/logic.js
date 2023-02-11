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
        center: [0, 30],
        zoom: 3,
        layers: [base, eqs]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};


function createMarkers(response) {

    var quakes = response.features;
    var quakeMarkers = [];

    for (var index = 0; index < quakes.length; index++) {
        var quake = quakes[index]
        var c = 255-parseInt(quake.geometry.coordinates[2])

        var quakeMarker = L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
            color: 'rgba(255,255,255, 0.2)',
            fillColor: `rgb(${c/3}, ${c/4}, ${c/2})`,
            fillOpacity: 0.6,
            radius: Math.sqrt(quake.properties.mag) * 100_000
        }).bindPopup(`${quake.geometry.coordinates[2]}`);

        quakeMarkers.push(quakeMarker);
    }

    createMap(L.layerGroup(quakeMarkers));
}

var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

d3.json(url).then(function(data){
    console.log(data);
    createMarkers(data);
});