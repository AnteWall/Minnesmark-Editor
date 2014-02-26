var mmEditor = (function () {
    //Public variables/functions
    var my = {

        },
    //Private Variables/functions
        map,
        browserSupportFlag,
        initialLocation,
        markers,
        polyPaths,
        radiusDistance,
        pathIndex,
        geoLocation,
        createSearchField,
        polylines;

    geoLocation = function(){
        /*
         Geolocation for starting position
         */
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
    };

    createSearchField = function(){

        ////// GOOGLE IMPLEMENTATION \\\\\\\
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
    };

    my.initializeEditor = function(){
        browserSupportFlag =  new Boolean();
        initialLocation = new google.maps.LatLng(64.182464, -51.723343);
        resetMarkerSystem();
        radiusDistance = 10;
        var mapOptions = {
            center: initialLocation,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions,  {
            mapTypeId: google.maps.MapTypeId.ROADMAP});

        geoLocation();
        createSearchField();
        google.maps.event.addListener(map, "zoom_changed", function(event) {
            for(var i = 0; i < markers.length; i++){
                polyPaths[markers[i].pathIndex] = markers[i].getPosition();
            }
            pathUpdate();
        });

    };

    createMarker = function(){

        var customImage = "/static/editor/img/marker.png"
        var newMarker = new MarkerWithLabel({
            position: map.getCenter(),
            draggable:true,
            icon:customImage,
            labelContent: (markers.length+1).toString(),
            labelAnchor: new google.maps.Point(3, 30),
            labelClass: "labels", // the CSS class for the label
            labelInBackground: false,
            animation: google.maps.Animation.DROP
        });
        newMarker.pathIndex = polyPaths.length;
        polyPaths.push(newMarker.getPosition());

        return newMarker;
    };

    createPolyLine = function(){
        var polyOptions = {
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            path: polyPaths,
            map:map,
            editable:true
        };
        var poly = new google.maps.Polyline(polyOptions);

        google.maps.event.addListener(poly, "mouseup", function(event) {
            if(event.edge !== undefined){
                for(var i = 0; i < markers.length; i++){
                    if(markers[i].pathIndex > event.edge){
                        markers[i].pathIndex += 1;
                    }
                }
            }

        });
        google.maps.event.addListener(poly, "mouseout", function(event) {
            pathUpdate();
        });
        return poly;
    };

    createInfoWindow = function(){
        //Add infoWindow for marker
        var iw = new google.maps.InfoWindow({
            content: "<div class='infoMarker'>Markörerna är placerade för nära varandra.</div>"
        });
        return iw;
    };

    createRadiusMarker = function(){
        return new google.maps.Circle({
            map: map,
            radius: radiusDistance,    // Meters
            fillColor: 'gray',
            strokeWeight:0
        });
    };

    collisionDetectMarkers = function(curMarker){
        for(var i = 0; i < markers.length; i++){
            if(markers[i] != curMarker){
                var distance = google.maps.geometry.spherical.computeDistanceBetween(curMarker.getPosition(),markers[i].getPosition());
                if(distance < radiusDistance*2){
                    return true;
                }
            }
        }
        return false;
    }


    my.addMarker = function(){
        var curMarkerCount = (markers.length+1);
        if(curMarkerCount <= 6){
            var newMarker = createMarker();
            polylines.push(createPolyLine());
            newMarker.iw = createInfoWindow();
            newMarker.radius = createRadiusMarker();

            newMarker.radius.bindTo('center', newMarker, 'position');
            //Event Listener for DragEnd(Drop) (Marker)
            google.maps.event.addListener(newMarker, "dragend", function(event) {
                if(markers.length > 1){
                    if(collisionDetectMarkers(newMarker)){
                        newMarker.iw.open(map,newMarker);
                    }else{
                        newMarker.iw.close();
                    }
                }
            });
            //Event Listener for Drag (Marker)
            google.maps.event.addListener(newMarker, "drag", function(event) {
                polyPaths[newMarker.pathIndex] = newMarker.getPosition();
                pathUpdate();
            });

            markers.push(newMarker);
            newMarker.setMap(map);

            //Change next marker to be placed indicator
            $("#markers-wrapper").find("[data-markerid='" + curMarkerCount.toString() + "']").hide();
            $("#markers-wrapper").find("[data-markerid='" + (curMarkerCount+1).toString() + "']").removeClass('hidden');
        }

    };

    pathUpdate = function(){
        for(var i = 0; i < polylines.length; i++){
            polylines[i].setPath(polyPaths);
        }
    }

    resetMarkerSystem = function(){
        markers = [];
        polylines = [];
        polyPaths = [];
    };

    my.removeMarker = function(){
        if(markers.length != 0){
            markers[markers.length-1].setMap(null);
            markers[markers.length-1].radius.setMap(null);
            if(markers.length == 1){
                for(var i = 0; i < polylines.length; i++){
                    polylines[i].setMap(null);
                }
                resetMarkerSystem();
            }else{
                markers.pop();

                var lastMarkerIndex = markers[markers.length-1].pathIndex;
                while(polyPaths.length > lastMarkerIndex+1){
                    polyPaths.pop();
                }
                pathUpdate();
            }
            //Change next marker to be placed indicator
            $("#markers-wrapper").find("[data-markerid='" + (markers.length+1).toString() + "']").show();
            $("#markers-wrapper").find("[data-markerid='" + (markers.length+2).toString() + "']").addClass('hidden');
        }
    };

    return my;
}());


$('document').ready(function(){
    mmEditor.initializeEditor();
    $('.remove-marker').on('click',function(){
        mmEditor.removeMarker();
    });
    $('.marker').on('click',function(){
        mmEditor.addMarker();
    });
});