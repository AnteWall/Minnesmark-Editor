$('document').ready(function(){

    function initialize() {
	var mapOptions = {
	    center: new google.maps.LatLng(-34.397, 150.644),
	    zoom: 8
	};
	console.log("test");
	var map = new google.maps.Map(document.getElementById("map-canvas"),
				      mapOptions);
	console.log(map);
    }
    google.maps.event.addDomListener(window, 'load', initialize);
    console.log("oho");
});