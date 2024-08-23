// Global object to hold shared state and functions
window.chatApp = window.chatApp || {};
let map = L.map('map').setView([40.4168, -3.7038], 13);
window.chatApp.mapMarkers = [];

(function() {
let NGSI_entities = []

// Add your custom PBF tiles using Leaflet.VectorGrid
L.tileLayer('http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);


window.chatApp.getPoIs = async function(coord=[], fiwareService="ld") {
  let query="";
  let limit = document.getElementById("limit").value;
  let orion_port = '1026'; //fiwareService === "v2" ? "1025" : "1026";
  let orion_url = 'http://localhost:1027/http://fiware-orion-' + fiwareService + ':' + orion_port;

  console.log('query con limit: ', limit);

  // NGSILD doesn't support ordering. See:
  // https://stackoverflow.com/questions/75106624/ordering-results-by-field-using-orion-ngsi-ld
  // however, there is a new commit under request that solves this issue:
  // https://github.com/FIWARE/context.Orion-LD/pull/1656/commits/0bf03678877a54000f8cc6520975ab5bf65838d5
  let orderBy = "relevance";
  let url = orion_url + '/ngsi-ld/v1/entities?local=true&type=PoI&options=concise&limit=' + limit + '&orderBy=' + orderBy;

  if(coord) {
    coord = await getZoomCoordinates();
    console.log('coord:', coord);
  }

  // Constructing the coordinates string for LD
  coord = coord.coord;
  let coordinates = [[
    [coord[0], coord[1]],
    [coord[2], coord[3]],
    [coord[4], coord[5]],
    [coord[6], coord[7]],
    [coord[0], coord[1]]
  ]];

  // by default ld - filter by GeoJSON polygon
  // see: https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_cim009v010801p.pdf
  const coordinatesString = JSON.stringify(coordinates);
  query = `&georel=within&geometry=Polygon&coordinates=${encodeURIComponent(coordinatesString)}`;

  //NGSIv2 query
  // see geoquery references here:
  // https://github.com/telefonicaid/fiware-orion/blob/master/doc/manuals/orion-api.md#Geographical%20Queries
  if(fiwareService === "v2") {
    coordinates =
   `${coord[1]},${coord[0]};${coord[3]},${coord[2]};${coord[5]},${coord[4]};${coord[7]},${coord[6]};${coord[1]},${coord[0]}`;
    console.log('coordinates: -> ', coordinates);
    url = orion_url + '/v2/entities?type=PoI&options=keyValues&limit=' + limit + '&orderBy=' + orderBy;
    query = '&georel=coveredBy&geometry=polygon&coords=' + coordinates;
    //query = '&georel=near;maxDistance:10000&geometry=point&coords=' + coord[1] + ',' + coord[0];
  }

  url = url + query;
  console.log('url:', url);
  try {
    const response =
        await fetch(
              url,
              {
                method: 'GET',
                headers: {
                  'origin': '*',
                  'fiware-service': fiwareService,
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
  let coord = await getZoomCoordinates() || [];
  window.chatApp.NGSI_entities = await window.chatApp.getPoIs(coord);

  // Remove all markers from the map
  if (window.chatApp.mapMarkers !== undefined) {
    console.log('removing markers, size: ' + window.chatApp.mapMarkers.length);
    for (let i = 0; i < window.chatApp.mapMarkers.length; i++) {
      console.log('removing marker: ' + window.chatApp.mapMarkers[i]);
      map.removeLayer(window.chatApp.mapMarkers[i]);
    }
  }
  window.chatApp.mapMarkers = [];

  window.chatApp.NGSI_entities.forEach(function(entity) {
    let location = entity.location.coordinates;
    let title = entity.title;
    let image = entity.image;
    console.log('title:', title);

    // Add a marker to the map in the location of the entity
    // this is reversed beceause the coordinates are in the format [longitude, latitude]
    // and Leaflet expects [latitude, longitude]
    // See: https://datatracker.ietf.org/doc/html/rfc7946
    let current_marker = L.marker([location[1], location[0]]);
    if(image) {
      let customIcon = L.icon({
        iconUrl: `./img/${image}`,
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
  let bounds = map.getBounds();
  let center = bounds.getCenter();
  let southWest = bounds.getSouthWest();
  let northEast = bounds.getNorthEast();
  let northWest = L.latLng(northEast.lat, southWest.lng);
  let southEast = L.latLng(southWest.lat, northEast.lng);

  let coordinates = [southWest.lng, southWest.lat, southEast.lng, southEast.lat, northEast.lng, northEast.lat, northWest.lng, northWest.lat];
  return {
    "coord": coordinates,
    "center": center,
    "zoom": map.getZoom()
  };
}
})();


window.chatApp.updateMap();
map.on('moveend', window.chatApp.updateMap);
map.on('keypress', window.chatApp.logKey);
// Add an event listener to the limit input field to update the PoIs when the limit changes
//document.getElementById("limit").addEventListener('onchange', window.chatApp.updateMap);
