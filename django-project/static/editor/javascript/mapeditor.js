$('document').ready(function(){
    var map;
    var browserSupportFlag =  new Boolean();
    var initialLocation = new google.maps.LatLng(59.319878, 18.065536);

    function initialize() {
	var mapOptions = {
	    center: new google.maps.LatLng(59.319878, 18.065536),
	    zoom: 8,
            disableDefaultUI: true,
            zoomControl: true

	};
	var map = new google.maps.Map(document.getElementById("map-canvas"),
				      mapOptions);
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
    }
    google.maps.event.addDomListener(window, 'load', initialize);
    
    
});