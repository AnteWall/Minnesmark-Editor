$('document').ready(function(){
    require(["/static/editor/javascript/mmEditor.js","/static/editor/javascript/mmSaveAndLoadRoute.js"],
        function(mmEditor,mmSaveAndLoadRoute) {
        mmEditor.initializeEditor();

        var data = mmSaveAndLoadRoute.getEditorData(mmEditor.loadRoute)
        //mmEditor.loadRoute(data);

        $('.station').on('click',function(){
            mmEditor.addStation();
        });
        $('.saveRoute').on('click',function(){
            console.log("Button clicked");
            mmSaveAndLoadRoute.saveToDatabase(mmEditor.getStations(),mmEditor.getPath());
        });
    });
});


