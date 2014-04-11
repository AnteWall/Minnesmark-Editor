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

    getIDfromURL = function(){
        patt = new RegExp(/\/editor\/\w*\/(\d+)/)
        id = patt.exec(document.URL);
        return id[1];
    }

    getStationsData = function(stations){

        var stations_data = []
        for(var i = 0; i < stations.length; i++){
            var latlng = stations[i].getPosition();
            var m_data= {
                "latitude": stations[i].getPosition().lat(),
                "longitude": stations[i].getPosition().lng(),
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
        route_data["route_id"] = parseInt(getIDfromURL());
        route_data["stations"] = getStationsData(stations);
        route_data["points"] = getPathData(path);
        console.log(JSON.stringify(route_data));
        var request = $.ajax({
            url: "/editor/saveRouteDB",
            type: "POST",
            data: JSON.stringify(route_data),
            datatype:JSON,
            contentType: "application/json;charset=utf-8",

            success: function(res){
                console.log(res);
                if(res["result"] == "ok"){
                    $p = $('<p>',{class:"success",text:res["message"]});
                }else{
                    $p = $('<p>',{class:"errror",text:res["message"]});
                }
                $p.appendTo($('.station')).hide().slideDown();
                setTimeout(function(){
                    $p.slideUp(function(){
                      $p.remove();
                    })
                },2500)
            }
        });

        request.done(function(msg) {
            //console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            alert( "Request failed: " + textStatus );
        });
    };

    my.getEditorData = function(callback){
        var editor_data = {}
        var route_id = getIDfromURL();
        var request = $.ajax({
            url: "/editor/getRoute/"+route_id,
            type: "GET",
            datatype:JSON,
            contentType: "application/json;charset=utf-8",
            success: function(res){
                console.log(res);
                if(res != "ERROR"){
                    callback(res);
                }else{
                    $('.fadeBGShow').remove();
                }
            }
        });


        return editor_data;
    };


    return my;
}());