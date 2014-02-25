var mmEditor = (function () {
    //Public variables/functions
    var my = {

        },
    //Private Variables/functions
        map,
        browserSupportFlag,
        initialLocation,
        markers,
        pathPositions,
        radiusDistance,
        markerIndex,
        geoLocation,
        createSearchField,
        positionIndexes;

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
        markers = [];
        pathPositions = [];
        positionIndexes = [];
        radiusDistance = 10;
        markerIndex = 0;
        var mapOptions = {
            center: new google.maps.LatLng(59.319878, 18.065536),
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions,  {
            mapTypeId: google.maps.MapTypeId.ROADMAP});

        geoLocation();
        createSearchField();
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
        newMarker.markerIndex = markerIndex;
        markerIndex +=1;
        positionIndexes.push(newMarker);
        pathPositions.push(newMarker.getPosition());

        return newMarker;
    };

    createPolyLine = function(){
        var polyOptions = {
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            path: pathPositions,
            map:map,
            editable:true
        };
        var poly = new google.maps.Polyline(polyOptions);
        poly.isPolyline = true;
        google.maps.event.addListener(poly, "mouseup", function(event) {
            console.log(pathPositions.length);
            console.log("Dropped new vertix!");
            console.log("Event - edge: " +event.edge);
            console.log("Event - vertex: " +event.vertex);
            if(event.vertex === undefined){
                console.log(event)
                positionIndexes.splice(event.edge+1,0,poly);
                reArrangePolyLines(event.edge);
            }else if(event.edge === undefined){
                //if(positionIndexes[i].isPolyline){
                  //  positionIndexes[i].setPath(pathPositions);
               // }
                reDrawPolylines();
            }
        });

        google.maps.event.addListener(poly, "dragstart", function(event) {
            console.log("dsaokpdsakds");
            reDrawPolylines();
        });


        return poly;
    };

    reArrangePolyLines = function(markerParentId){
        markerIndex = positionIndexes.length;
        for(var i = markerParentId+1; i < positionIndexes.length;i++){
            if(positionIndexes[i].isPolyline === undefined && positionIndexes[i] != undefined){
                positionIndexes[i].markerIndex +=1;
            }
        }
    }

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

    reDrawPolylines = function(){
        for(var i = 0; i < markers.length; i++){
            markers[i].poly.setPath(pathPositions);
        }
    }

    my.addMarker = function(){
        var curMarkerCount = (markers.length+1);
        if(curMarkerCount <= 6){
            var newMarker = createMarker();
            newMarker.poly = createPolyLine();
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
                pathPositions[newMarker.markerIndex] = (newMarker.getPosition());
                reDrawPolylines();
            });

            markers.push(newMarker);
            newMarker.setMap(map);

            //Change next marker to be placed indicator
            $("#markers-wrapper").find("[data-markerid='" + curMarkerCount.toString() + "']").hide();
            $("#markers-wrapper").find("[data-markerid='" + (curMarkerCount+1).toString() + "']").removeClass('hidden');
        }
        google.maps.event.addListener(map, "zoom_changed", function(event) {
            reDrawPolylines();
        });
    };

    my.removeMarker = function(){
        markers[markers.length-1].setMap(null);
        markers[markers.length-1].radius.setMap(null);
        markers[markers.length-1].poly.setMap(null);
        markers.pop();
        pathPositions.pop();
        markerIndex -= 1;

        //Change next marker to be placed indicator
        $("#markers-wrapper").find("[data-markerid='" + (markers.length+1).toString() + "']").show();
        $("#markers-wrapper").find("[data-markerid='" + (markers.length+2).toString() + "']").addClass('hidden');

        reDrawPolylines();
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