/**
 * Created by dob on 4/4/14.
 */
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

    getStationsData = function(stations){

        var stations_data = []
        for(var i = 0; i < stations.length; i++){
            var latlng = stations[i].getPosition();
            var m_data= {
                "latitude": latlng.lat(),
                "longitude": latlng.lng(),
                "index": parseInt(stations[i].pathIndex),
                "number": parseInt(stations[i].labelContent)
            };
            stations_data.push(m_data);
        }
        return stations_data;
    }

    getPathData = function(path){
        paths_data = []
        for(var i = 0; i < path.length; i++){
            var p_data = {
                "latitude": path[i].lat(),
                "longitude": path[i].lng(),
                "index": parseInt(i)
            };
            paths_data.push(p_data);
        }
        return paths_data;
    }

    my.saveToDatabase = function(stations,path){
        console.log("Function entered");
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
        route_data["markers"] = getStationsData(stations);
        route_data["points"] = getPathData(path);
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