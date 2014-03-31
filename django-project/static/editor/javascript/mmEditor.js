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
        stations;
        //radiusDistance,
        //geoLocation,

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
        resetTrailSystem();

        polyLine = createPolyLine();

        optionsWindow = new google.maps.InfoWindow({
            content: "<div class='delStation'><button class='remove-button' data-removeIndex=''>Ta bort</button></div>"
        });

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
            for(var i = 0; i < stations.length; i++){
                if(stations[i].pathIndex > previousPoint){
                    stations[i].pathIndex += 1;
                }
            }
           /* var position = event.latLng;
            var nextIndex = event.edge;
            var newSwingPoint = createSwingPoint(position, nexIndex);
            swingPoints.push()*/
        }
      });

        /*google.maps.event.addListener(poly, "click", function(event) {
            addOptionsWindow(event.latLng,station.pathIndex);
        });*/

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
            labelAnchor: new google.maps.Point(3, 40),
            labelClass: "labels",       // the CSS class for the label
            labelContent: (stations.length+1).toString(),
            labelInBackground: false,
            //labelStyle,
            labelVisible: true,         // visible if marker is
            // CUSTOM PROPERTIES
            pathIndex: pathIndex

        });

        google.maps.event.addListener(station, "drag", function(event) {
            polyLine.getPath().setAt(station.pathIndex,station.getPosition());
            //console.log("Drag: " + polyLine.getPath().length);
        });

        google.maps.event.addListener(station, "dragend", function(event) {
            if(stations.length > 1)
                collisionControll(station,0);
            //console.log(polyLine.getPath().length);
        });

        google.maps.event.addListener(station, "click", function(event) {
            addOptionsWindow(event.latLng,station.pathIndex);
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

    addOptionsWindow = function(latLng,index){
        optionsWindow.setContent("<div class='delStation'><button class='remove-button' data-removeIndex='"+index+"'>Ta bort</button></div>");
        optionsWindow.setPosition(latLng);
        optionsWindow.open(map);

        $('.remove-button').on('click',function(){
            console.log("\nindex: " + index);
            my.removePoint(index);
        })
    }

    my.removePoint = function(pathIndex){
    var astrid = 0;
        for (var station_index=0; station_index<stations.length; station_index++){
            console.log("current pathIndex: " + stations[station_index].pathIndex);
            //console.log("kommer vi såhär långt?");

            if(stations[station_index].pathIndex === pathIndex){
                //console.log("ska starta for-loopen");

                // Check so station_index is valid
                var alan = stations[station_index].pathIndex;
                if (station_index+1 < stations.length) {
                    alan = stations[station_index+1].pathIndex-1;
                }
                var dave = stations[station_index].pathIndex;
                if (station_index-1 >= 0) {
                    dave = stations[station_index-1].pathIndex+1;
                }

                console.log("start: " + alan + ", stop: " + dave);
                for (var path_index = alan; path_index >= dave; --path_index) {
                    console.log("remove pathIndex: " + path_index);
                    polyLine.getPath().removeAt(path_index);
                    astrid++;
                }
                //console.log("stations[i].pathIndex === index");
                stations[station_index].setMap(null);
                stations[station_index].radius.setMap(null);
                console.log("station. length before splice: " + stations.length);
                stations.splice(station_index,1);
                console.log("station. length after splice: " + stations.length);
            }

            if(stations[station_index] != undefined && stations[station_index].pathIndex >= pathIndex){
                console.log("station_index: " + station_index);
                console.log("station pathindex before astrid: " + stations[station_index].pathIndex);
                stations[station_index].pathIndex -= Math.max(1, astrid);
                console.log("station pathindex after astrid: " + stations[station_index].pathIndex);
                stations[station_index].labelContent = station_index+1;
                stations[station_index].label.draw();
            }
        }
        optionsWindow.close();

    };


    my.removeStation = function(){

    };


    resetTrailSystem = function(){
        stations = [];
        //polylines = [];
        //polyPaths = [];
        //collisionWindows = [];
    };

  return my;
}());