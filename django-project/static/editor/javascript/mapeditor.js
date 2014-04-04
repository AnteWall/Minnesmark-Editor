$('document').ready(function(){
    require(["/static/editor/javascript/mmEditor.js","/static/editor/javascript/mmSaveRoute.js"],
        function(mmEditor,mmSaveRoute) {
        mmEditor.initializeEditor();
        $('.station').on('click',function(){
            mmEditor.addStation();
        });
        $('.saveRoute').on('click',function(){
            console.log("Button clicked");
            mmSaveRoute.saveToDatabase(mmEditor.getStations(),mmEditor.getPath());
        });
    });
});