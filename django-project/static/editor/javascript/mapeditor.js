$('document').ready(function(){
    require(["/static/editor/javascript/mmEditor.js",
             "/static/editor/javascript/mmSaveRoute.js"], function(mmEditor,mmSaveRoute) {
        mmEditor.initializeEditor();
        $('.remove-station').on('click',function(){
            mmEditor.removeStation();
        });
        $('.station').on('click',function(){
            mmEditor.addStation();
        });
        $('.saveRoute').on('click',function(){
            mmSaveRoute.saveToDatabase(mmEditor.getStations(),mmEditor.getPaths());
        });
    });

});