$('document').ready(function(){
    require(["/static/editor/javascript/mmEditor.js"], function(mmEditor) {
        mmEditor.initializeEditor();
        $('.station').on('click',function(){
            mmEditor.addStation();
        });
        /*$('.remove-button').on('click',function(){
            mmEditor.removePoint(parseInt($(this).data('removeindex')));
        });*/
    });
});