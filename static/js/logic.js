function createMap(eqs) {

    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var baseMaps = {
        "Base Map": base,
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

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
};


function createMarkers(response) {

    var quakes = response.features;
    var markers = [];

    for (var index = 0; index < quakes.length; index++) {
        var quake = quakes[index];
        var color = 255-parseInt(quake.geometry.coordinates[2]);
        var date = new Date(quake.properties.time);
        var magnitude = quake.properties.mag;
        var location = [quake.geometry.coordinates[1], quake.geometry.coordinates[0]];
        var place = quake.properties.place;
        var depth = quake.geometry.coordinates[2];

        var marker = L.circle(location, {
            color: 'rgba(255,255,255, 0.2)',
            fillColor: `rgb(${color/3}, ${color/4}, ${color/2})`,
            fillOpacity: 0.6,
            radius: Math.sqrt(magnitude) * 100_000
        }).bindPopup(`<h2>${place}</h2><h3>Magnitude: ${magnitude} - Depth: ${depth}</h3><hr><p>${date}</p>`);

        markers.push(marker);
    }

    createMap(L.layerGroup(markers));
}

var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

d3.json(url).then(createMarkers);