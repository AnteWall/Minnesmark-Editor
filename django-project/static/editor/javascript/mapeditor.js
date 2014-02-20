$('document').ready(function(){

    function initialize() {

	var mapOptions = {
	    center: new google.maps.LatLng(59.319878, 18.065536),
	    zoom: 12,
            disableDefaultUI: true,
            zoomControl: true

	};

	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions,  {
	    mapTypeId: google.maps.MapTypeId.ROADMAP});

        // Try W3C Geolocation (Preferred)
        if(navigator.geolocation) {
            browserSupportFlag = true;
            navigator.geolocation.getCurrentPosition(function(position) {
                initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                map.setCenter(initialLocation);
            }, function() {
                handleNoGeolocation(browserSupportFlag);
            });
        }
        // Browser doesn't support Geolocation
        else {
            browserSupportFlag = false;
            handleNoGeolocation(browserSupportFlag);
        }

        function handleNoGeolocation(errorFlag) {
            if (errorFlag == true) {
                console.log("Geolocation service failed.");
            } else {
                console.log("Your browser doesn't support geolocation. We've placed you in Stockholm.");
            }
            map.setCenter(initialLocation);
        }



	////// GOOGLE IMPLEMENTATION \\\\\\\

	var markers = [];

	// Create the search box and link it to the UI element.
	var input = /** @type {HTMLInputElement} */(
	    document.getElementById('pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var searchBox = new google.maps.places.SearchBox(
	    /** @type {HTMLInputElement} */(input));

	// [START region_getplaces]
	// Listen for the event fired when the user selects an item from the
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', function() {
	    var places = searchBox.getPlaces();

	    for (var i = 0, marker; marker = markers[i]; i++) {
		marker.setMap(null);
	    }

	    // For each place, get the icon, place name, and location.
	    var bounds = new google.maps.LatLngBounds();
	    for (var i = 0, place; place = places[i]; i++) {
		var image = {
		    url: place.icon,
		    size: new google.maps.Size(71, 71),
		    origin: new google.maps.Point(0, 0),
		    anchor: new google.maps.Point(17, 34),
		    scaledSize: new google.maps.Size(25, 25)
		};

		bounds.extend(place.geometry.location);
	    }

	    map.fitBounds(bounds);
	    map.setZoom(15); // Set zoom when search
	});
	// [END region_getplaces]

	// Bias the SearchBox results towards places that are within the bounds of the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
	    var bounds = map.getBounds();
	    searchBox.setBounds(bounds);
	});

    }
    google.maps.event.addDomListener(window, 'load', initialize);
    
    
});