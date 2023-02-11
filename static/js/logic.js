function createMap(eqs) {

    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var baseMaps = {
        "Base Map": base,
        "<span style='color: green'>Topographical Map</span>": topo
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

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map){
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 50, 100, 200, 500],
            labels = [];
            div.innerHTML += '<center><h2>Earthquake<br>Depth (km)</h2><hr></center>'
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    }
    legend.addTo(myMap);
};

function getColor(depth){
    
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


function createMarkers(response) {

    var quakes = response.features;
    var markers = [];

    for (var i = 0; i < quakes.length; i++) {
        var quake = quakes[i];
        var date = new Date(quake.properties.time);
        var magnitude = quake.properties.mag;
        var location = [quake.geometry.coordinates[1], quake.geometry.coordinates[0]];
        var place = quake.properties.place;
        var depth = depth = quake.geometry.coordinates[2];

        var marker = L.circle(location, {
            color: 'black',
            weight: 1,
            fillColor: getColor(depth),
            fillOpacity: 0.6,
            radius: Math.sqrt(magnitude) * 100_000
        }).bindPopup(`<h2>${place}</h2><h3>Magnitude: ${magnitude} - Depth: ${depth}</h3><hr><p>${date}</p>`);

        markers.push(marker);
    }
    createMap(L.layerGroup(markers));
};

var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

d3.json(url).then(createMarkers);