



$('document').ready(function(){
    require(["/static/editor/javascript/mmEditor.js"], function(mmEditor) {
        console.log(new google.maps.LatLng(50,50));
        mmEditor.initializeEditor();
        $('.remove-marker').on('click',function(){
            mmEditor.removeMarker();
        });
        $('.marker').on('click',function(){
            mmEditor.addMarker();
        });
    });

});