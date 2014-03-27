var mmEditor = (function () {
    //Public variables/functions
    var my = {

        },
    //Private Variables/functions
        map,
        browserSupportFlag,
        initialLocation,
        searchPositions,
        stations,
        polyPaths,
        radiusDistance,
        pathIndex,
        geoLocation,
        createSearchField,
        polylines,
        optionsWindow,
        collisionWindows;
    my.numberOfActiveStations = function(){
        return stations.length;
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

            for (var i = 0, searchPosition; searchPosition = searchPositions[i]; i++) {
                searchPosition.setMap(null);
            }

            var searchPosition = createSearchPosition(place);
            searchPositions = [];
            searchPositions.push(searchPosition);

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
        resetTrailSystem();
        resetSearchSystem();
        radiusDistance = 10;

        optionsWindow = new google.maps.InfoWindow({
            content: "<div class='delStation'><button class='remove-button' data-removeIndex=''>Ta bort</button></div>"
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
            for(var i = 0; i < stations.length; i++){
                polyPaths[stations[i].pathIndex] = stations[i].getPosition();
            }
            pathUpdate();
        });

    };

    createSearchPosition = function(place){

        var customImage = "/static/editor/img/place.png"

        //google.maps.Icon object:
        var image = {
                url: customImage,
                size: new google.maps.Size(56, 43),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(28, 26)
            };

        var newSearchPosition = new google.maps.Marker({
        map: map,
        icon: image,
        position: place.geometry.location
        });

        return newSearchPosition;
    };

    createStation = function(){

        var customImage = {
            url: '/static/editor/img/station-on-map.png',
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(21, 22)
        };
        var newStation = new MarkerWithLabel({
            position: map.getCenter(),
            draggable:true,
            icon:customImage,
            labelContent: (stations.length+1).toString(),
            labelAnchor: new google.maps.Point(3, 40),
            labelClass: "labels", // the CSS class for the label
            labelInBackground: false,
            animation: google.maps.Animation.DROP
        });
        collisionControll(newStation);
        newStation.pathIndex = polyPaths.length;
        polyPaths.push(newStation.getPosition());

        return newStation;
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
                for(var i = 0; i < stations.length; i++){
                    if(stations[i].pathIndex > event.edge){
                        stations[i].pathIndex += 1;
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

    createRadiusStation = function(){
        return new google.maps.Circle({
            map: map,
            radius: radiusDistance,    // Meters
            fillColor: 'gray',
            strokeWeight:0
        });
    };

    collisionControll = function(station){
        for(var i = 0; i< stations.length; i++) {
            var distance = google.maps.geometry.spherical.computeDistanceBetween(stations[i].getPosition(),station.getPosition());
            if (station.labelContent !== stations[i].labelContent && distance < radiusDistance*2) {
                //0.00042 is about the same as radius*2 (and the answer to life, the universe and everything)
                station.setPosition(new google.maps.LatLng(station.getPosition().lat(), stations[i].getPosition().lng()+0.00042));
                polyPaths[station.pathIndex] = station.getPosition();
                pathUpdate();
                collisionControll(station);
            }
        }
    };

    addOptionsWindow = function(latLng,index){
        optionsWindow.setContent("<div class='delStation'><button class='remove-button' data-removeIndex='"+index+"'>Ta bort</button></div>");
        optionsWindow.setPosition(latLng);
        optionsWindow.open(map);
        $('.remove-button').on('click',function(){
            mmEditor.removePoint(parseInt($(this).data('removeindex')));
        })
    }

    my.addStation = function(){
        var curStationCount = (stations.length+1);
        if(curStationCount <= 6){
            var newStation = createStation();
            polylines.push(createPolyLine());
            newStation.radius = createRadiusStation();

            newStation.radius.bindTo('center', newStation, 'position');
            //Event Listener for DragEnd(Drop) (Station)
            google.maps.event.addListener(newStation, "dragend", function(event) {
                if(stations.length > 1){
                    collisionControll(newStation);
                }
            });
            //Event Listener for Drag (Station)
            google.maps.event.addListener(newStation, "drag", function(event) {
                polyPaths[newStation.pathIndex] = newStation.getPosition();
                pathUpdate();
            });
            google.maps.event.addListener(newStation, "click", function(event) {
                addOptionsWindow(event.latLng,newStation.pathIndex);
            });
            stations.push(newStation);
            newStation.setMap(map);
            //Change next Station to be placed indicator
            $("#stations-wrapper").find("[data-stationid='" + curStationCount.toString() + "']").hide();
            $("#stations-wrapper").find("[data-stationid='" + (curStationCount+1).toString() + "']").removeClass('hidden');
        }

    };

    my.removePoint = function(index){
        polyPaths.splice(index,1);
        for(var i = 0; i < stations.length; i++){
            if(stations[i].pathIndex == index){
                stations[i].setMap(null);
                stations[i].radius.setMap(null);
                stations.splice(i,1);
            }
            if(stations[i] != undefined){
                if(stations[i].pathIndex > index){
                    stations[i].pathIndex -=1;
                }
            }
        }
        optionsWindow.close();
        pathUpdate();
        updateLabels();
        //collisionControll(); //TODO fix when fixing swing points bug
    };

    pathUpdate = function(){
        for(var i = 0; i < polylines.length; i++){
            polylines[i].setPath(polyPaths);
        }
    };

    updateLabels = function(){
        for(var i = 0; i < stations.length; i++){
            stations[i].labelContent = i+1;
            stations[i].label.draw();
        }
    }


    resetTrailSystem = function(){
        stations = [];
        polylines = [];
        polyPaths = [];
        collisionWindows = [];
    };

    resetSearchSystem = function(){
        searchPositions = [];
    };

    my.removeStation = function(){
        if(stations.length != 0){
            stations[stations.length-1].setMap(null);
            stations[stations.length-1].radius.setMap(null);
            if(stations.length == 1){
                for(var i = 0; i < polylines.length; i++){
                    polylines[i].setMap(null);
                }
                resetTrailSystem();
            }else{
                stations.pop();

                var lastStationIndex = stations[stations.length-1].pathIndex;
                while(polyPaths.length > lastStationIndex+1){
                    polyPaths.pop();
                }
                pathUpdate();
                updateLabels();
            }
            //Change next station to be placed indicator
            $("#stations-wrapper").find("[data-stationid='" + (stations.length+1).toString() + "']").show();
            $("#station-wrapper").find("[data-stationid='" + (stations.length+2).toString() + "']").addClass('hidden');
        }
    };

    return my;
}());


$('document').ready(function(){
    mmEditor.initializeEditor();
    $('.remove-station').on('click',function(){
        mmEditor.removeStation();
    });
    $('.station').on('click',function(){
        mmEditor.addStation();
    });

});