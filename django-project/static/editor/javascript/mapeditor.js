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
        /* Could be used with ajax instead of form in profile.html
        $('.createRoute').on('click',function(){
            mmSaveRoute.createRoute($('#route_name').val());
        });*/
    });

});