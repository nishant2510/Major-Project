var map, places, infoWindow;
var markers = [];
var autocomplete;
var StateRestrict = { 'state': 'mh' };
//list of markers (container for markers)
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

var states = {
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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: states['mh'].zoom,
        center: states['mh'].center,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
    });

    infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
    });

    autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(
            document.getElementById('autocomplete')), {
        types: ['(cities)'],
        componentRestrictions: StateRestrict
    });
    places = new google.maps.places.PlacesService(map);

    autocomplete.addListener('place_changed', onPlaceChanged);

    document.getElementById('state').addEventListener(
        'change', setAutocompleteCountry);
}

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

function search() {
    var search = {
        bounds: map.getBounds(),
        types: ['car_repair']
    };

    places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();
            for (var i = 0; i < results.length; i++) {
                var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                var markerIcon = MARKER_PATH + markerLetter + '.png';
                // Use marker animation to drop the icons incrementally on the map.
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
    var state = document.getElementById('state').value;
    if (state == 'all') {
        autocomplete.setComponentRestrictions({ 'state': [] });
        map.setCenter({ lat: 15, lng: 0 });
        map.setZoom(2);
    } else {
        autocomplete.setComponentRestrictions({ 'country': 'in' });
        map.setCenter(states[state].center);
        map.setZoom(states[state].zoom);
    }
    clearResults();
    clearMarkers();
}

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

function addResult(result, i) {
    var results = document.getElementById('results');
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';

    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
    tr.onclick = function () {
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

function showInfoWindow() {
    var marker = this;
    places.getDetails({ placeId: marker.placeResult.place_id },
        function (place, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            }
            infoWindow.open(map, marker);
            buildIWContent(place);
        });
}

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
    } else {
        document.getElementById('iw-phone-row').style.display = 'none';
    }

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

    if (place.website) {
        var fullUrl = place.website;
        var website = hostnameRegexp.exec(place.website);
        if (website === null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
        }
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = website;
    } else {
        document.getElementById('iw-website-row').style.display = 'none';
    }
}