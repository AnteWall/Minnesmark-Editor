



$('document').ready(function(){
    require(["/static/editor/javascript/mmEditor.js",
             "/static/editor/javascript/mmSaveRoute.js"], function(mmEditor,mmSaveRoute) {
        mmEditor.initializeEditor();
        $('.remove-marker').on('click',function(){
            mmEditor.removeMarker();
        });
        $('.marker').on('click',function(){
            mmEditor.addMarker();
        });
        $('.saveRoute').on('click',function(){
            mmSaveRoute.saveToDatabase(mmEditor.getMarkers(),mmEditor.getPaths());
        });
    });

});