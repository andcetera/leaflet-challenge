function createMap(quakes) {
    var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var baseMaps = {
        "Base Map": basemap
    };

    var overlayMaps = {
        "Earthquakes": quakes
    };

    var myMap = L.map("map", {
        center: [38, -96],
        zoom: 5,
        layers: [baseMaps, overlayMaps]
    });
    
}

function createMarkers(data) {

    var quakes = data.features;
    var quakeMarkers = [];

    for (index = 0; index < quakes.length; index++) {
        var quake = quakes[index]
        
        var quakemark = L.marker([quake.geometry.coordinates[1], quake.geometry.coordinates[0]]).bindPopup('hi');
        var quakeMarker = L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
            color: 'white',
            fillColor: quake.properties.mag,
            fillOpacity: 0.5,
            radius: Math.sqrt(quake.geometry.coordinates[2])
        }).bindPopup('hi');

        quakeMarkers.push(quakemark);
    }
    createMap(L.layerGroup(quakeMarkers));
}

var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

d3.json(url).then(createMarkers);