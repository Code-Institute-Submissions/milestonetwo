var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = { 'country': [] };
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

//List of properties for countries contain details about zoom, and their location on a map
var countries = {
        'aust': {
          center: {lat: -26.4390917 , lng: 133.281323},
          zoom: 4},
        'bel' : {
          center: {lat:50.5010789 , lng: 4.4764595},
          zoom:4
        },
       'chn' : {
          center: { lat:35.8592948 , lng:104.1361118},
          zoom:4},
          
        'cyp' : {
          center: { lat:35.8592948 , lng: 104.1361118},
          zoom:4
        },
        'den' : {
          center : { lat:55.9396761 , lng: 9.5155848 },
          zoom:4
        },
        'egypt' : {
          center: {lat:26.8357675 , lng:30.7956597},
        zoom:4
      },

      'fr' : { 
        center:{lat:46.71109 , lng:1.7191036},
      zoom:4
      },
      'greece' : {
        center: {lat:38.2749497 , lng:23.8102717},
        zoom:4
      },
      'ice' : { 
        center: { lat:64.9312762 , lng:-19.0211697},
        zoom:4
      },
      'in' : {
        center: { lat:21.1289956 , lng: 82.7792201},
        zoom:4
      },
      'ire': { 
        center: {lat:53.428665 , lng: -8.3320801},
        zoom:4
      },
      'italy' : {
        center: {lat:41.29246, lng: 12.5736108},
        zoom:4
      },
      'jamaica': {
        center: { lat:18.1155174, lng: -77.2760026},
        zoom:4
      },
      'jap' : {
        center :{lat:37.4900318, lng: 136.4664008},
        zoom:4
      },
      'lith' : {
        center: {lat:55.1735998 , lng : 23.8948016},
        zoom:4
      },
      'mex' :{
        center: {lat:23.6260333 , lng:-102.5375005},
        zoom:4
      },
      'nor':{
        center: {lat:64.5783089 , lng:17.888237},
        zoom:4
      },
      'port' : {
        center : {lat:39.557191 , lng:-7.8536599},
        zoom:4
      },

      'spain' : {
        center: {lat:40.2085  , lng:-3.713},
        zoom:4
      },
      'swed':{
        center:{ lat:62.1983366 , lng:17.5671981},
        zoom:4
      },
      'turk' :{
        center:{lat:38.9573415 , lng: 35.240741},
        zoom:4
      },
      'uk': { center: { lat: 54.8, lng: -4.6 },zoom: 5}};

//Resets the map and all the input fields.
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
    zoom: 2,
    center: countries['uk'].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false,
    componentRestrictions: countryRestrict

   });

 infoWindow = new google.maps.InfoWindow({
  content: document.getElementById('info-content')
 });

 // Create the autocomplete object and associate it with the UI input control.
 // Restrict the search to the default country, and to place type "cities".
 autocomplete = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */
  (
   document.getElementById('autocomplete')), {
   types: ['(cities)'],
   componentRestrictions: countryRestrict
  }); places = new google.maps.places.PlacesService(map);

 autocomplete.addListener('place_changed', onPlaceChanged); 
 document.getElementById('foodRadio').addEventListener('change', onPlaceChanged); 
 document.getElementById('accomodationRadio').addEventListener('change', onPlaceChanged); 
 document.getElementById('touristRadio').addEventListener('change', onPlaceChanged);
 // Add a DOM event listener to react when the user selects a country.
 document.getElementById('country').addEventListener('change', setAutocompleteCountry); 
 document.getElementById('reset-button').addEventListener("click", setAutocompleteCountry);

}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
 if ($("#accomodationRadio").is(':checked')) {
  var place = autocomplete.getPlace();
  if (place.geometry) {
   map.panTo(place.geometry.location);
   map.setZoom(15);
   searchHotel();
   
  }
  else {
   $('#autocomplete').attr("placeholder","Enter a city");
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
   $('#autocomplete').attr("placeholder","Enter a city");
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
   $('#autocomplete').attr("placeholder","Enter a city");
  }
 }

}

// Search for hotels in the selected city, within the viewport of the map.
function searchHotel() {
 var search = {
  bounds: map.getBounds(),
  types: ['lodging' , 'hotel']
  
 };

 places.nearbySearch(search, function(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
   clearResults();
   clearMarkers();
   document.getElementById('results-header').innerHTML = "Results";
   // Create a marker for each hotel found, and
   // assign a letter of the alphabetic to each marker icon.
   for (var i = 0; i < results.length; i++) {
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';
    // Use marker animation to drop the icons incrementally on the map.
    markers[i] = new google.maps.Marker({
     position: results[i].geometry.location,
     animation: google.maps.Animation.DROP,
     icon: markerIcon
    });
    // If the user clicks a hotel marker, show the details of that hotel
    // in an info window.
    markers[i].placeResult = results[i];
    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
    setTimeout(dropMarker(i), i * 100);
    addResult(results[i], i);
   }
  }
 });
}

// Search for restaurants in the selected city, within the viewport of the map.
function searchRestaurant() {
 var search = {
  bounds: map.getBounds(),
  types: ['restaurant', 'bar' , 'pub' , 'food']
 };

 places.nearbySearch(search, function(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
   clearResults();
   clearMarkers();
   document.getElementById('results-header').innerHTML = "Results";
   // Create a marker for each resteraunt found, and add letter.
   for (var i = 0; i < results.length; i++) {
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';
    // Use animation to drop the icons incrementally on the map.
    markers[i] = new google.maps.Marker({
     position: results[i].geometry.location,
     animation: google.maps.Animation.DROP,
     icon: markerIcon
    });
    // If the user clicks a resteraunt marker, show the details of that hotel
    // in an info window.
    markers[i].placeResult = results[i];
    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
    setTimeout(dropMarker(i), i * 100);
    addResult(results[i], i);
   }
  }
 });
}

// Search for attractions in the selected city, within the viewport of the map.
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
   // Create a marker for each attraction found, and
   // assign a letter of the alphabetic to each marker icon.
   for (var i = 0; i < results.length; i++) {
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';
    // Use marker animation to drop the icons incrementally on the map.
    markers[i] = new google.maps.Marker({
     position: results[i].geometry.location,
     animation: google.maps.Animation.DROP,
     icon: markerIcon
    });
    // If the user clicks a attraction marker, show the details of that hotel
    // in an info window.
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

// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
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

//Adds found results to table below map in webpage
function addResult(result, i) {
 var results = document.getElementById('results');
 var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
 var markerIcon = MARKER_PATH + markerLetter + '.png';

 var tr = document.createElement('tr');
 //Creates the striped effect you see By making every odd number darker
 tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
 tr.onclick = function() {
  google.maps.event.trigger(markers[i], 'click');
 };

 var iconTd = document.createElement('td');
 var nameTd = document.createElement('td');
 var icon = document.createElement('img');
 icon.src = markerIcon;
 icon.setAttribute('class', 'placeIcon');
 icon.setAttribute('className', 'placeIcon');
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

// Get the place details for a hotel,resteraunt,attraction. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
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

// Load the place information into the HTML elements used by the info window.

function buildIWContent(place) {

 document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
  'src="' + place.icon + '"/>';
 document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
  '">' + place.name + '</a></b>';
 document.getElementById('iw-address').textContent = place.vicinity;

 if (place.formatted_phone_number) {
  document.getElementById('iw-phone-row').style.display = '';
  document.getElementById('iw-phone').textContent =
   place.formatted_phone_number;
 }
 else {
  document.getElementById('iw-phone-row').style.display = 'none';
 }



 // Assign a five-star rating to the place
 // to indicate the rating the place has earned, and a white star ('&#10025;')
 if (place.rating) {
  var ratingHtml = '';
  for (var i = 0; i < 5; i++) {
   if (place.rating < (i + 0.5)) {
    ratingHtml += '&#10025;';
   }
   else {
    ratingHtml += '&#10029;';
   }
   document.getElementById('iw-rating-row').style.display = '';
   document.getElementById('iw-rating').innerHTML = ratingHtml;
  }
 }
 else {
  document.getElementById('iw-rating-row').style.display = 'none';
 }

 // The regexp isolates the first part of the URL (domain plus subdomain)
 // to give a short URL for displaying in the info window.
 if (place.website) {
  var fullUrl = place.website;
  var website = hostnameRegexp.exec(place.website);
  if (website === null) {
   website = 'http://' + place.website + '/';
   fullUrl = website;
  }
  document.getElementById('iw-website-row').style.display = '';
  document.getElementById('iw-website').textContent = website;
 }
 else {
  document.getElementById('iw-website-row').style.display = 'none';
 }
}
