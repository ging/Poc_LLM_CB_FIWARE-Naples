// Global object to hold shared state and functions
window.chatApp = window.chatApp || {};
var map = L.map('map').setView([40.4168, -3.7038], 13);
window.chatApp.mapMarkers = [];

(function() {
var NGSI_entities = []

// Add your custom PBF tiles using Leaflet.VectorGrid
L.tileLayer('http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);


window.chatApp.getPoIs = async function(coord=[]) {
  var query="";
  var limit = document.getElementById("limit").value;
  console.log('query con limit: ', limit);

  // NGSILD doesn't support ordering. See:
  // https://stackoverflow.com/questions/75106624/ordering-results-by-field-using-orion-ngsi-ld
  var orderBy = "relevance";
  var url = 'http://localhost:1027/http://fiware-orion:1026/ngsi-ld/v1/entities?type=PoI&limit=' + limit + '&orderBy=' + orderBy;

  if(coord) {
    coord = await getZoomCoordinates();
  }

  // Constructing the coordinates string
  const coordinates = [[
    [coord[0], coord[1]],
    [coord[2], coord[3]],
    [coord[4], coord[5]],
    [coord[6], coord[7]],
    [coord[0], coord[1]]
  ]];

  // filter by GeoJSON polygon
  // see: https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_cim009v010801p.pdf
  const coordinatesString = JSON.stringify(coordinates);
  query = `&georel=within&geometry=Polygon&coordinates=${encodeURIComponent(coordinatesString)}`;
  url = url + query;
  console.log('url:', url);
  try {
    const response =
        await fetch(
              url,
              {
                method: 'GET',
                headers: {
                  'origin': '*'
                }
              })
    if (!response.ok) {
        throw new Error('Network response was not ok. Status: ' + response.status + ' ' + response.statusText);
    }
    NGSI_entities = await response.json();
    return NGSI_entities;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    document.getElementById('result').textContent = 'Error: ' + error.message;
  }
}

window.chatApp.updateMap = async function () {
  var coord = await getZoomCoordinates() || [];
  window.chatApp.NGSI_entities = await window.chatApp.getPoIs(coord);

  // Remove all markers from the map
  if (window.chatApp.mapMarkers !== undefined) {
    console.log('removing markers, size: ' + window.chatApp.mapMarkers.length);
    for (var i = 0; i < window.chatApp.mapMarkers.length; i++) {
      console.log('removing marker: ' + window.chatApp.mapMarkers[i]);
      map.removeLayer(window.chatApp.mapMarkers[i]);
    }
  }
  window.chatApp.mapMarkers = [];

  window.chatApp.NGSI_entities.forEach(function(entity) {
    var location = entity.location.value.coordinates;
    var title = entity.title.value;
    var image = entity.image;
    console.log('title:', title);

    // Add a marker to the map in the location of the entity
    // this is reversed beceause the coordinates are in the format [longitude, latitude]
    // and Leaflet expects [latitude, longitude]
    // See: https://datatracker.ietf.org/doc/html/rfc7946
    var current_marker = L.marker([location[1], location[0]]);
    if(image) {
      var customIcon = L.icon({
        iconUrl: `./img/${image.value}`,
        iconSize: [50, 50],
        popupAnchor: [0, -25],
        className: 'custom-icon'
      });
      current_marker.setIcon(customIcon);
    }
    current_marker.addTo(map).bindPopup(title);
    window.chatApp.mapMarkers.push(current_marker);
  });
}


// Function to log the coordinates of the four corners of the map to the console
async function getZoomCoordinates () {
  var bounds = map.getBounds();
  var southWest = bounds.getSouthWest();
  var northEast = bounds.getNorthEast();
  var northWest = L.latLng(northEast.lat, southWest.lng);
  var southEast = L.latLng(southWest.lat, northEast.lng);

  var coordinates = [southWest.lng, southWest.lat, southEast.lng, southEast.lat, northEast.lng, northEast.lat, northWest.lng, northWest.lat];
  return coordinates;
}
})();




window.chatApp.updateMap();
map.on('moveend', window.chatApp.updateMap);

// Add an event listener to the limit input field to update the PoIs when the limit changes
//document.getElementById("limit").addEventListener('onchange', window.chatApp.updateMap);