var map, places, infoWindow;
var markers = [];
var autocomplete;
var StateRestrict = { 'state': 'all' };
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

// Definig all states lat/long to make the map div responsive when user selects the particular state
var states = {
    'all': {
        center: { lat: 25, lng: 80 },
        zoom: 5
    },
    'mh': {
        center: { lat: 19.9915, lng: 76.5139 },
        zoom: 6.9
    },
    'gj': {
        center: { lat: 22.2587, lng: 71.1924 },
        zoom: 7
    },
    'rj': {
        center: { lat: 27.0238, lng: 74.2179 },
        zoom: 6.5
    },
    'tn': {
        center: { lat: 11.1271, lng: 78.6569 },
        zoom: 7.3
    },

    'dh': {
        center: { lat: 28.7041, lng: 77.1025 },
        zoom: 7.3
    },

    'ka': {
        center: { lat: 15.317277, lng: 75.713890 },
        zoom: 7.3
    },

    'kl': {
        center: { lat: 10.850516, lng: 76.271080 },
        zoom: 7.5
    },

    'up': {
        center: { lat: 28.207609, lng: 79.826660 },
        zoom: 7.5
    },

    'ts': {
        center: { lat: 17.123184, lng: 79.208824 },
        zoom: 7.5
    },

    'mp': {
        center: { lat: 23.473324, lng: 77.947998 },
        zoom: 7.5
    },

    'hr': {
        center: { lat: 29.238478, lng: 76.431885 },
        zoom: 7.5
    },

    'as': {
        center: { lat: 26.244156, lng: 92.537842 },
        zoom: 7.5
    },

    'wb': {
        center: { lat: 22.978624, lng: 87.747803 },
        zoom: 7.5
    },

    'od': {
        center: { lat: 20.940920, lng: 84.803467 },
        zoom: 7.5
    },

    'hp': {
        center: { lat: 32.084206, lng: 77.571167 },
        zoom: 7.5
    },

    'pb': {
        center: { lat: 31.51997398, lng: 75.98000281 },
        zoom: 7.5
    },

    'sk': {
        center: { lat: 27.3333303, lng: 88.6166475 },
        zoom: 7.5
    },

    'uk': {
        center: { lat: 30.32040895, lng: 78.05000565 },
        zoom: 7.5
    },

    'jk': {
        center: { lat: 34.29995933, lng: 74.46665849 },
        zoom: 7.5
    },

    'ga': {
        center: { lat: 15.491997, lng: 73.81800065 },
        zoom: 7.5
    },

    'ap': {
        center: { lat: 14.7504291, lng: 78.57002559 },
        zoom: 7.5
    },

    'ar': {
        center: { lat: 27.10039878, lng: 93.61660071 },
        zoom: 7.5
    },

};

// Creating an instance of maps and showing it in the map div with some default settings
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: states['all'].zoom,
        center: states['all'].center,
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

    // let state = document.getElementById('state').value
    // let center = { lat:states[state].center.lat, lng:states[state].center.lng};
    // const defaultBounds = {
    //     north: center.lat + 2,
    //     south: center.lat - 2,
    //     east: center.lng + 2,
    //     west: center.lng - 2,
    // };

    autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')),
        {
            // bounds: defaultBounds,
            types: ['(cities)'],
            componentRestrictions: StateRestrict,
            // strictBounds: true
        }
    );
    places = new google.maps.places.PlacesService(map);

    // To make the map responsive when user selects a city
    autocomplete.addListener('place_changed', onPlaceChanged);

    // Add a event listener to respond when the user selects a state
    document.getElementById('state').addEventListener('change', setAutocompleteState);
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

// Set the state restriction based on user input and center and zoom the map
function setAutocompleteState() {
    var state = document.getElementById('state').value;

    // if (state == 'all') {
    //     autocomplete.setComponentRestrictions({ 'state': 'all' });
    //     map.setCenter({ lat: 25, lng: 80 });
    //     map.setZoom(5);
    // } else {
    //     autocomplete.setComponentRestrictions({ 'state': state });
    //     map.setCenter(states[state].center);
    //     map.setZoom(states[state].zoom);
    // }

    autocomplete.setComponentRestrictions({ 'state': state });
    map.setCenter(states[state].center);
    map.setZoom(states[state].zoom);

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
        document.getElementById('iw-phone-row').style.display = 'none';
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