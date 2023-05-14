var map, places, infoWindow;
var markers = [];
var autocomplete;
var StateRestrict = { 'city': 'pb' };
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

// Definig all cities lat/long to make the map div responsive when user selects the particular city
var cities = {
    'all': {
        center: { lat: 31.51997398, lng: 75.98000281 },
        zoom: 8
    },
    'asr': {
        center: { lat: 31.633980, lng: 74.872261 },
        zoom: 13
    },
    'chd': {
        center: { lat: 30.7333, lng: 76.7794 },
        zoom: 12
    },
    'juc': {
        center: { lat: 31.3260, lng: 75.5762 },
        zoom: 13
    },
    'ldh': {
        center: { lat: 30.9010, lng: 75.8573 },
        zoom: 13
    },
    'pta': {
        center: { lat: 30.3398, lng: 76.3869 },
        zoom: 13
    }
};

// Creating an instance of maps and showing it in the map div with some default settings
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: cities['all'].zoom,
        center: cities['all'].center,
        mapTypeControl: true,
        panControl: true,
        zoomControl: true,
        streetViewControl: true
    });

    // This will be used to show the info about the place selected by the user
    infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
    });

    // Using autocomplete API to suggest the city names to users

    let city = document.getElementById('city').value
    let center = { lat:cities[city].center.lat, lng:cities[city].center.lng};
    console.log(JSON.stringify(center));
    const defaultBounds = {
        north: center.lat + 1.5,
        south: center.lat - 1.5,
        east: center.lng + 1.5,
        west: center.lng - 1.5,
    };

    autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')),
        {
            bounds: defaultBounds,
            types: ["establishment"],
            componentRestrictions: StateRestrict,
            strictBounds: true
        }
    );
    places = new google.maps.places.PlacesService(map);

    // To make the map responsive when user selects a city
    autocomplete.addListener('place_changed', onPlaceChanged);

    // Add a event listener to respond when the user selects a state
    document.getElementById('city').addEventListener('change', setAutocompleteState);
}

// To get the place details for the city selected by the user and zoom it
function onPlaceChanged() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        search();
    } else {
        document.getElementById('autocomplete').placeholder = 'Enter a city';
    }
}

// Search for gas stations in the selected city.
function search() {
    var search = {
        bounds: map.getBounds(),
        types: ['gas_station']
    };

    places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();

            // Create a marker and assign a alphabet on it for each gas station found
            for (var i = 0; i < results.length; i++) {
                var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                var markerIcon = MARKER_PATH + markerLetter + '.png';

                // Use marker animation to drop the icons incrementally on the map.
                markers[i] = new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon
                });

                // If the user clicks a gas station marker, show the details of that hotel in the info window
                markers[i].placeResult = results[i];
                google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                setTimeout(dropMarker(i), i * 100);
                addResult(results[i], i);
            }
        }
    });
}

// Helper function to clear out the markers from map
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
        }
    }
    markers = [];
}

// Set the city restriction based on user input and center and zoom the map
function setAutocompleteState() {
    var city = document.getElementById('city').value;

    // if (state == 'all') {
    //     autocomplete.setComponentRestrictions({ 'state': 'all' });
    //     map.setCenter({ lat: 25, lng: 80 });
    //     map.setZoom(5);
    // } else {
    //     autocomplete.setComponentRestrictions({ 'state': state });
    //     map.setCenter(states[state].center);
    //     map.setZoom(states[state].zoom);
    // }

    autocomplete.setComponentRestrictions({ 'city': city });
    map.setCenter(cities[city].center);
    map.setZoom(cities[city].zoom);

    clearResults();
    clearMarkers();
}

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

// To show all the neares gas stations in list format on the UI
function addResult(result, i) {
    var results = document.getElementById('results');
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';

    // Setting different colors for adjacent items in the list
    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
    tr.onclick = function () {
        google.maps.event.trigger(markers[i], 'click');
    };

    // Appending items in the list
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

// Get and show details for a gas station in info window,
function showInfoWindow() {
    var marker = this;
    places.getDetails({ placeId: marker.placeResult.place_id },
        function (place, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            }
            infoWindow.open(map, marker);
            buildIWContent(place);
        }
    );
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
    document.getElementById('iw-icon').innerHTML = '<img class="gasStationIcon" ' +
        'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
        '">' + place.name + '</a></b>';
    document.getElementById('iw-address').textContent = place.vicinity;

    if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent =
            place.formatted_phone_number;
    } else {
        document.getElementById('iw-phone-row').style.display = 'Phone Number Not Available';
    }

    // To assign the rating of the place
    if (place.rating) {
        var ratingHtml = '';
        for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
            document.getElementById('iw-rating-row').style.display = '';
            document.getElementById('iw-rating').innerHTML = ratingHtml;
        }
    } else {
        document.getElementById('iw-rating-row').style.display = 'none';
    }

    // To give a short URL for displaying in the info window.
    if (place.website) {
        var fullUrl = place.website;

        // The regexp isolates the first part of the URL (domain plus subdomain)
        // var website = hostnameRegexp.exec(place.website);
        // if (website === null) {
        //     website = 'http://' + place.website + '/';
        //     fullUrl = website;
        // }

        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = fullUrl;
    } else {
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = 'Website not available';
    }
}