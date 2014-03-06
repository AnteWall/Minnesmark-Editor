var mmEditor = (function () {
    //Public variables/functions
    var my = {

        },
    //Private Variables/functions
        map,
        browserSupportFlag,
        initialLocation,
        searchMarkers,
        markers,
        polyPaths,
        radiusDistance,
        pathIndex,
        geoLocation,
        createSearchField,
        polylines,
        optionsWindow,
        collisionWindows;
    my.numberOfActiveMakers = function(){
        return markers.length;
    }
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

        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function() {
            var currentZoom = map.getZoom();

            var place = searchBox.getPlaces()[0];

            for (var i = 0, searchMarker; searchMarker = searchMarkers[i]; i++) {
                searchMarker.setMap(null);
            }

            var searchMarker = createSearchMarker(place);
            searchMarkers = [];
            searchMarkers.push(searchMarker);

            var bounds = new google.maps.LatLngBounds();
            bounds.extend(place.geometry.location);

            map.fitBounds(bounds);
            map.setZoom(currentZoom);

        });

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
        resetSearchSystem();
        radiusDistance = 10;

        optionsWindow = new google.maps.InfoWindow({
            content: "<div class='delMarker'><button class='remove-button' data-removeIndex=''>Ta bort</button></div>"
        });

        var mapOptions = {
            center: initialLocation,
            mapTypeControlOptions: {
                mapTypeId: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.TERRAIN,
                google.maps.MapTypeId.HYBRID,
                google.maps.MapTypeId.SATELLITE
                ],
                position: google.maps.ControlPosition.BOTTOM_CENTER,
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            panControl: false,
            streetViewControl: false,
            zoom: 15,
            zoomControl: true,
            zoomOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            }
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        geoLocation();
        createSearchField();
        google.maps.event.addListener(map, "zoom_changed", function(event) {
            for(var i = 0; i < markers.length; i++){
                polyPaths[markers[i].pathIndex] = markers[i].getPosition();
            }
            pathUpdate();
        });

    };

    createSearchMarker = function(place){

        var customImage = "/static/editor/img/place.png"

        //google.maps.Icon object:
        var image = {
                url: customImage,
                size: new google.maps.Size(56, 43),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(28, 26)
            };

        var newSearchMarker = new google.maps.Marker({
        map: map,
        icon: image,
        position: place.geometry.location
        });

        return newSearchMarker;
    };

    createMarker = function(){

        var customImage = {
            url: '/static/editor/img/station.png',
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(21, 22)
        };
        var newMarker = new MarkerWithLabel({
            position: map.getCenter(),
            draggable:true,
            icon:customImage,
            labelContent: (markers.length+1).toString(),
            labelAnchor: new google.maps.Point(3, 40),
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

        google.maps.event.addListener(poly, "click", function(event) {
           if(event.vertex != undefined){
               addOptionsWindow(event.latLng,event.vertex);
           }
        });

        return poly;
    };

    createCollisionWindow = function(){
        //Add infoWindow for marker
        var iw = new google.maps.InfoWindow({
            content: "<div class='infoMarker'>Punkterna är placerade för nära varandra.</div>"
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

    collisionControll = function(){
        for(var i = 0; i < collisionWindows.length; i++){
            collisionWindows[i].close();
            collisionWindows[i].setMap(null);
        }
        collisionWindows = [];
        for(var i = 0; i < polyPaths.length;i++){
            for(var j = i+1; j < polyPaths.length; j++){
                var distance = google.maps.geometry.spherical.computeDistanceBetween(polyPaths[j],polyPaths[i]);
                if(distance < radiusDistance*2){
                    var iw = createCollisionWindow();
                    var jw = createCollisionWindow();
                    iw.setPosition(polyPaths[i]);
                    jw.setPosition(polyPaths[j]);
                    iw.open(map);
                    jw.open(map);
                    collisionWindows.push(iw);
                    collisionWindows.push(jw);
                }
            }
        }
    };

    addOptionsWindow = function(latLng,index){
        optionsWindow.setContent("<div class='delMarker'><button class='remove-button' data-removeIndex='"+index+"'>Ta bort</button></div>");
        optionsWindow.setPosition(latLng);
        optionsWindow.open(map);
        $('.remove-button').on('click',function(){
            mmEditor.removePoint(parseInt($(this).data('removeindex')));
        })
    }

    my.addMarker = function(){
        var curMarkerCount = (markers.length+1);
        if(curMarkerCount <= 6){
            var newMarker = createMarker();
            polylines.push(createPolyLine());
            newMarker.radius = createRadiusMarker();

            newMarker.radius.bindTo('center', newMarker, 'position');
            //Event Listener for DragEnd(Drop) (Marker)
            google.maps.event.addListener(newMarker, "dragend", function(event) {
                if(markers.length > 1){
                    collisionControll();
                }
            });
            //Event Listener for Drag (Marker)
            google.maps.event.addListener(newMarker, "drag", function(event) {
                polyPaths[newMarker.pathIndex] = newMarker.getPosition();
                pathUpdate();
            });
            google.maps.event.addListener(newMarker, "click", function(event) {
                addOptionsWindow(event.latLng,newMarker.pathIndex);
            });
            markers.push(newMarker);
            newMarker.setMap(map);
            //collisionControll();
            //Change next marker to be placed indicator
            $("#markers-wrapper").find("[data-markerid='" + curMarkerCount.toString() + "']").hide();
            $("#markers-wrapper").find("[data-markerid='" + (curMarkerCount+1).toString() + "']").removeClass('hidden');
        }

    };

    my.removePoint = function(index){
        polyPaths.splice(index,1);
        for(var i = 0; i < markers.length; i++){
            if(markers[i].pathIndex == index){
                markers[i].setMap(null);
                markers[i].radius.setMap(null);
                markers.splice(i,1);
            }
            if(markers[i] != undefined){
                if(markers[i].pathIndex > index){
                    markers[i].pathIndex -=1;
                }
            }
        }
        optionsWindow.close();
        pathUpdate();
        updateMarkerLabel();
        collisionControll();
    };

    pathUpdate = function(){
        for(var i = 0; i < polylines.length; i++){
            polylines[i].setPath(polyPaths);
        }
    };

    updateMarkerLabel = function(){
        for(var i = 0; i < markers.length; i++){
            markers[i].labelContent = i+1;
            markers[i].label.draw();
        }
    }


    resetMarkerSystem = function(){
        markers = [];
        polylines = [];
        polyPaths = [];
        collisionWindows = [];
    };

    resetSearchSystem = function(){
        searchMarkers = [];
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
                updateMarkerLabel();
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