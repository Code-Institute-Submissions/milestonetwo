var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = { 'country': [] };
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

//List of properties for countries and their location on a map
var countries = {
 'aust': { center: { lat: -26.4390917, lng: 133.281323 }, zoom: 4 },
 'bel': { center: { lat: 50.5010789, lng: 4.4764595 }, zoom: 4 },
 'chn': { center: { lat: 35.8592948, lng: 104.1361118 }, zoom: 4 },
 'cyp': { center: { lat: 35.8592948, lng: 104.1361118 }, zoom: 4 },
 'den': { center: { lat: 55.9396761, lng: 9.5155848 }, zoom: 4 },
 'egypt': { center: { lat: 26.8357675, lng: 30.7956597 }, zoom: 4 },
 'fr': { center: { lat: 46.71109, lng: 1.7191036 }, zoom: 4 },
 'greece': { center: { lat: 38.2749497, lng: 23.8102717 }, zoom: 4 },
 'ice': { center: { lat: 64.9312762, lng: -19.0211697 }, zoom: 4 },
 'in': { center: { lat: 21.1289956, lng: 82.7792201 }, zoom: 4 },
 'ire': { center: { lat: 53.428665, lng: -8.3320801 }, zoom: 4 },
 'italy': { center: { lat: 41.29246, lng: 12.5736108 }, zoom: 4 },
 'jamaica': { center: { lat: 18.1155174, lng: -77.2760026 }, zoom: 4 },
 'jap': { center: { lat: 37.4900318, lng: 136.4664008 }, zoom: 4 },
 'lith': { center: { lat: 55.1735998, lng: 23.8948016 }, zoom: 4 },
 'mex': { center: { lat: 23.6260333, lng: -102.5375005 }, zoom: 4 },
 'nor': { center: { lat: 64.5783089, lng: 17.888237 }, zoom: 4 },
 'port': { center: { lat: 39.557191, lng: -7.8536599 }, zoom: 4 },
 'spain': { center: { lat: 40.2085, lng: -3.713 }, zoom: 4 },
 'swed': { center: { lat: 62.1983366, lng: 17.5671981 }, zoom: 4 },
 'turk': { center: { lat: 38.9573415, lng: 35.240741 }, zoom: 4 },
 'uk': { center: { lat: 54.8, lng: -4.6 }, zoom: 5 },
 'usa': { center: { lat: 37.1, lng: -95.7 }, zoom: 3 }
};



function reset() {
 clearResults();
 clearMarkers();
 $('#country')[0].selectedIndex = 0;
 $("#autocomplete").val("");
 $('#results-header').innerHTML("");
 map.setZoom(2);
 map.setCenter(countries["uk"].center);
 map.componentRestrictions = { 'country': [] };
 place = "";

}


function initMap() {
 $("#accomodationRadio").prop("checked", true);
 map = new google.maps.Map(document.getElementById('map'), {
  zoom: 5,
  center: countries['uk'].center,
 });

 infoWindow = new google.maps.InfoWindow({
  content: document.getElementById('info-content')
 });

 autocomplete = new google.maps.places.Autocomplete((
  document.getElementById('autocomplete')), {
  types: ['(cities)'],
  componentRestrictions: countryRestrict
 });
 places = new google.maps.places.PlacesService(map);

 autocomplete.addListener('place_changed', onPlaceChanged);
 document.getElementById('foodRadio').addEventListener('change', onPlaceChanged);
 document.getElementById('accomodationRadio').addEventListener('change', onPlaceChanged);
 document.getElementById('touristRadio').addEventListener('change', onPlaceChanged);
}

function onPlaceChanged() {
 if ($("#accomodationRadio").is(':checked')) {
  var place = autocomplete.getPlace();
  if (place.geometry) {
   map.panTo(place.geometry.location);
   map.setZoom(15);
   searchHotel();

  }
  else {
   $('#autocomplete').attr("placeholder", "Enter a city");
  }
 }
 else if ($("#foodRadio").is(':checked')) {
  var place = autocomplete.getPlace();
  if (place.geometry) {
   map.panTo(place.geometry.location);
   map.setZoom(15);
   searchRestaurant();
  }
  else {
   $('#autocomplete').attr("placeholder", "Enter a city");
  }
 }
 else if ($("#touristRadio").is(':checked')) {
  var place = autocomplete.getPlace();
  if (place.geometry) {
   map.panTo(place.geometry.location);
   map.setZoom(15);
   searchAttractions();
  }
  else {
   $('#autocomplete').attr("placeholder", "Enter a city");
  }
 }

}

function searchHotel() {
 var search = {
  bounds: map.getBounds(),
  types: ['lodging', 'hotel']
 };

 places.nearbySearch(search, function(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
   clearResults();
   clearMarkers();
   document.getElementById('results-header').innerHTML = "Results";

   for (var i = 0; i < results.length; i++) {
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';
    markers[i] = new google.maps.Marker({
     position: results[i].geometry.location,
     animation: google.maps.Animation.DROP,
     icon: markerIcon
    });

    markers[i].placeResult = results[i];
    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
    setTimeout(dropMarker(i), i * 100);
    addResult(results[i], i);
   }
  }
 });
}

function searchRestaurant() {
 var search = {
  bounds: map.getBounds(),
  types: ['restaurant', 'bar', 'pub', 'food']
 };

 places.nearbySearch(search, function(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
   clearResults();
   clearMarkers();
   document.getElementById('results-header').innerHTML = "Results";
   for (var i = 0; i < results.length; i++) {
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));

    var markerIcon = MARKER_PATH + markerLetter + '.png';
    markers[i] = new google.maps.Marker({
     position: results[i].geometry.location,
     animation: google.maps.Animation.DROP,
     icon: markerIcon
    });
    markers[i].placeResult = results[i];
    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
    setTimeout(dropMarker(i), i * 100);
    addResult(results[i], i);
   }
  }
 });
}

function searchAttractions() {
 var search = {
  bounds: map.getBounds(),
  types: ['museum', 'art_gallery', 'park', 'tour']
 };

 places.nearbySearch(search, function(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
   clearResults();
   clearMarkers();
   document.getElementById('results-header').innerHTML = "Results";

   for (var i = 0; i < results.length; i++) {
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';
    markers[i] = new google.maps.Marker({
     position: results[i].geometry.location,
     animation: google.maps.Animation.DROP,
     icon: markerIcon
    });
    markers[i].placeResult = results[i];
    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
    setTimeout(dropMarker(i), i * 100);
    addResult(results[i], i);
   }
  }
 });
}

function clearMarkers() {
 for (var i = 0; i < markers.length; i++) {
  if (markers[i]) {
   markers[i].setMap(null);
  }
 }
 markers = [];
}

function setAutocompleteCountry() {
 var country = $('#country').val();
 if (country == 'all') {
  autocomplete.setComponentRestrictions({ 'country': [] });
  map.setCenter({ lat: 15, lng: 0 });
  map.setZoom(2);
 }
 else {
  autocomplete.setComponentRestrictions({ 'country': country });
  map.setCenter(countries[country].center);
  map.setZoom(countries[country].zoom);
 }
 clearResults();
 clearMarkers();
}

function dropMarker(i) {
 return function() {
  markers[i].setMap(map);
 };
}

function addResult(result, i) {
 var results = document.getElementById('results');
 var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
 var markerIcon = MARKER_PATH + markerLetter + '.png';
 var tr = document.createElement('tr');
 tr.onclick = function() {
  google.maps.event.trigger(markers[i], 'click');
 };

 var iconTd = document.createElement('td');
 var nameTd = document.createElement('td');
 var icon = document.createElement('img');
 icon.src = markerIcon;

 var name = document.createTextNode(result.name);
 iconTd.appendChild(icon);
 nameTd.appendChild(name);
 tr.appendChild(iconTd);
 tr.appendChild(nameTd);
 results.appendChild(tr);
}

function clearResults() {
 var results = document.getElementById('results');
 while (results.childNodes[0]) {
  results.removeChild(results.childNodes[0]);
 }
}

function showInfoWindow() {
 var marker = this;
 places.getDetails({ placeId: marker.placeResult.place_id },
  function(place, status) {
   if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
   }
   infoWindow.open(map, marker);
   buildIWContent(place);

  });
}
