
var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var myMap = L.map("map", {
    center: [38, -96],
    zoom: 5,
    layers: [basemap]
});

function createMarkers(data) {

    var quakes = data.features;
    var quakeMarkers = [];

    for (index = 0; index < quakes.length; index++) {
        var quake = quakes[index]
        
        var quakeMarker = L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
            color: 'white',
            fillColor: quake.properties.mag,
            fillOpacity: 0.5,
            radius: Math.sqrt(quake.geometry.coordinates[2])
        }).bindPopup('hi');

        quakeMarkers.push(quakeMarker);
    }
}

var url = '';

d3.json(url).then(createMarkers);