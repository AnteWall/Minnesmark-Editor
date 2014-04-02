/**
* Created by ante on 2014-02-26.
* Modified by tina on 2014-03-28.
*/
define(function () {
    //Public variables/functions
    var my = {

        },
    //Private Variables/functions
        browserSupportFlag,
        initialLocation,
        map,
        optionsWindow,
        polyLine,
        swingPoints,
        stations,
        radiusDistance;

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
                // Set initial location to geographical location
                initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                //console.log("Found location." + initialLocation);
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
                console.log("Geolocation service failed. We've placed you in Stockholm.");
            } else {
                console.log("Your browser doesn't support geolocation. We've placed you in Stockholm.");
            }
            //map.setCenter(initialLocation);
        }
    };

    my.initializeEditor = function(){
        browserSupportFlag =  new Boolean();
        initialLocation = new google.maps.LatLng(59.321693,17.886825); // Drottningholm, Stockholm
        resetSearchSystem();
        resetTrailSystem();
        radiusDistance = 10;

        var mapOptions = {
            center: initialLocation,
            panControl: false,
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
            streetViewControl: false,
            zoom: 15,
            zoomControl: true,
            zoomOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            }
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        geoLocation();
        createSearchField();

        polyLine = createPolyLine();

        optionsWindow = new google.maps.InfoWindow({
            content: ""
        });

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

    resetSearchSystem = function(){
        searchPositions = [];
    };

    createPolyLine = function(){

        var polyOptions = {
            clickable: true,        // handle mouse events
            draggable: false,       // line can be moved
            editable: true,         // adds control points
            geodesic: false,        // straight or curved lines
            //icons,                // icons along the line
            map: map,               // map to display on
            //path,                 // points on the line
            suppressUndo: true,     // undo button when moving line
            strokeColor: '#000000', // color
            strokeOpacity: 1.0,     // opacity between 0.0 and 1.0
            strokeWeight: 3,        // width in pixels
            visible: true           // visible on map
            //zIndex,               // compared to other polys
        };

        var poly = new google.maps.Polyline(polyOptions);

        google.maps.event.addListener(poly, "mouseup", function(event) {
            // edge = the line (between stations and/or swing points)
            previousPoint = event.edge;
            if(previousPoint !== undefined) {
                //console.log("This is an edge.");
                for(var i = 0; i < stations.length; i++){
                    if(stations[i].pathIndex > previousPoint){
                        stations[i].pathIndex += 1;
                    }
                }
            }
        });

        /*google.maps.event.addListener(poly, "mouseout", function(event) {
            collisionControll();
        });*/

        google.maps.event.addListener(poly, "click", function(event) {
            if(event.vertex !== undefined) {
                //console.log("This is a vertex ("+ event.vertex +").");
                addOptionsWindow(event.latLng,event.vertex,my.removePoint);
            }
        });

      return poly;

    };

    my.addStation = function(){
        var curStationCount = (stations.length + 1);

        if(curStationCount <= 6){
            var position = map.getCenter();
            var path = polyLine.getPath();
            var nextIndex = path.length;
            path.push(position);
            var newStation = createStation(position, nextIndex);

            stations.push(newStation);
        }

    };

    createStation = function(position, pathIndex){

        var customImage = {
            url: '/static/editor/img/station-on-map.png',
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(21, 22)
        };
        var station = new MarkerWithLabel({
            // DEFAULT PROPERTIES
            //anchorPoint,          // offset of InfoWindow from marker pos
            animation: google.maps.Animation.DROP, // when added to map
            clickable: true,        // handle mouse events
            crossOnDrag: true,      // cross beneath marker on drag
            //cursor,               // what mouse cursor to show on hover
            draggable:true,         // marker can be moved
            flat: false,            // marker shadow
            icon:customImage,       // foreground icon
            map: map,               // map to display on
            optimized: false,       // render many markers as one,
                                    // not supported by MarkerWithLabel
            position: position,     // latlng
            raiseOnDrag: false,     // raise/lower marker on drag
            //shadow,               // what shadow image to show
            //shape,                // 
            //title,                // rollover text
            visible: true,          // visible on map
            //zIndex,               // compared to other markers

            // MARKERWITHLABEL PROPERTIES
            //crossImage,
            //handCursor,
            labelAnchor: new google.maps.Point(-25, 17),
            labelClass: "labels",       // the CSS class for the label
            labelContent: "Station " + (stations.length+1).toString(),
            labelInBackground: false,
            //labelStyle,
            labelVisible: true,         // visible if marker is

            // CUSTOM PROPERTIES
            pathIndex: pathIndex
        });

        google.maps.event.addListener(station, "drag", function(event) {
            polyLine.getPath().setAt(station.pathIndex,station.getPosition());
        });

        google.maps.event.addListener(station, "dragend", function(event) {
            if(stations.length > 1)
                collisionControll(station,0);
        });

        google.maps.event.addListener(station, "click", function(event) {
            addOptionsWindow(event.latLng,station.pathIndex,my.removeStation);
        });

        station.radius = createStationRadius();
        station.radius.bindTo('center', station, 'position');
        collisionControll(station,0);

        return station;
    };

    createStationRadius = function(){
        return new google.maps.Circle({
            map: map,
            radius: radiusDistance,    // Meters
            fillColor: 'gray',
            strokeWeight:0
        });
    };

    collisionControll = function(movingStation, init){
        //TODO re-implement swing point collision control
        if (init === stations.length)
            return; 
        for(var i = init; i< stations.length; i++) {

            stationaryStation = stations[i];

            var spherical = google.maps.geometry.spherical;
            var distance = spherical.computeDistanceBetween(
                stationaryStation.getPosition(),movingStation.getPosition());

            if (movingStation.labelContent !== stationaryStation.labelContent && 
                distance < radiusDistance*2) {

                var newPosition  = spherical.computeOffset(
                    stationaryStation.getPosition(), radiusDistance*2, 90);
                movingStation.setPosition(newPosition);
                polyLine.getPath().setAt(movingStation.pathIndex,newPosition);

                collisionControll(movingStation,init+1);
            }
        }
    };

    addOptionsWindow = function(latLng,index,func){
        var content = "<div class='delStation clearfix'>" +
            "<h3>Station "+(index+1)+"</h3>" +
            "<button class='btn'>Klar</button>" +
            "<div class='input-wrapper'>" +
            "<label for='lng'>Longitude</label> " +
            "<input id='lng'' type='text' name='longitude'value='"+latLng.lng()+"' >" +
            "</div>" +
            "<div class='input-wrapper'>" +
            "<label for='lat'>Latitude</label> " +
            "<input id='lat' type='text' name='latitude'value='"+latLng.lat()+"' >" +
            "</div>" +
            "<button class='remove-button btn orange round del-station-btn' data-removeIndex='"+index+"'><span class='typcn typcn-minus'></span></button>" +
            "<p class='small-text'>Ta Bort Station<p/></div>"
        optionsWindow.setContent(content);
        optionsWindow.setPosition(latLng);
        optionsWindow.open(map);

        $('.remove-button').on('click',function(){
            func(index);
        })
    }

    my.removePoint = function(pathIndex){
        polyLine.getPath().removeAt(pathIndex);
        for (var sIndex=0; sIndex<stations.length; sIndex++){
            if(stations[sIndex] != undefined && stations[sIndex].pathIndex >= pathIndex){
                stations[sIndex].pathIndex -= 1;
            }
        }
        optionsWindow.close();
    };

    my.removeStation = function(pathIndex){
        var Decrease = 0;
        for (var sIndex=0; sIndex<stations.length; sIndex++){

            if(stations[sIndex].pathIndex === pathIndex){

                // Check so sIndex is valid
                var removeFrom = stations[sIndex].pathIndex;
                if (sIndex+1 < stations.length) {
                    removeFrom = stations[sIndex+1].pathIndex-1;
                }
                var removeTo = stations[sIndex].pathIndex;
                if (sIndex-1 >= 0) {
                    removeTo = stations[sIndex-1].pathIndex+1;
                }

                for (var pIndex = removeFrom; pIndex >= removeTo; --pIndex) {
                    polyLine.getPath().removeAt(pIndex);
                    Decrease++;
                }
                stations[sIndex].setMap(null);
                stations[sIndex].radius.setMap(null);
                stations.splice(sIndex,1);
            }

            if(stations[sIndex] != undefined && stations[sIndex].pathIndex >= pathIndex){
                stations[sIndex].pathIndex -= Math.max(1,Decrease);
                stations[sIndex].labelContent = sIndex+1;
                stations[sIndex].label.draw();
            }
        }
        optionsWindow.close();
    };

    resetTrailSystem = function(){
        stations = [];
        //collisionWindows = [];
    };

  return my;
}());