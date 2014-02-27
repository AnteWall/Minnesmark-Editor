/**
 * Created by ante on 2014-02-26.
 */
define(function(){
    var my = {

        },
        csrfSafeMethod,
        getCookie;

    csrfSafeMethod = function (method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    };
    getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    getMarkersData = function(markers){

        var markers_data = []
        for(var i = 0; i < markers.length; i++){
            var latlng = markers[i].getPosition();
            var m_data= {
                "latitude": latlng.lat(),
                "longitude": latlng.lng(),
                "index": parseInt(markers[i].pathIndex),
                "number": parseInt(markers[i].labelContent)
            };
            markers_data.push(m_data);
        }
        return markers_data;
    }

    getPathData = function(paths){
        paths_data = []
        for(var i = 0; i < paths.length; i++){
            var p_data = {
                "latitude": paths[i].lat(),
                "longitude": paths[i].lng(),
                "index": parseInt(i)
            };
            paths_data.push(p_data);
        }
        return paths_data;
    }
    my.saveToDatabase = function(markers,paths){
        var csrftoken = getCookie('csrftoken');

        $.ajaxSetup({
            crossDomain: false, // obviates need for sameOrigin test
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

        var route_data = {};
        route_data["markers"] = getMarkersData(markers);
        route_data["points"] = getPathData(paths);
        var request = $.ajax({
            url: "/editor/saveRouteDB",
            type: "POST",
            data: JSON.stringify(route_data),
            datatype:JSON,
            contentType: "application/json;charset=utf-8",

            success: function(res){
                console.log(res);
            }
        });

        request.done(function(msg) {
            //console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            alert( "Request failed: " + textStatus );
        });
    };


    return my;
}());