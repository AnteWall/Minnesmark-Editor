/**
 * Created by ante on 2014-03-27.
 */
$('document').ready(function(){

    $('.tour-list li').on('click',function(e){
        /*
            If Not has Active class, Hide all tour-menus
            and display the clicked one
         */
        if(!$(this).hasClass('active')){
            $(".tour-list li").each(function() {
                $(this).removeClass('active');
                $(this).find('.typcn-chevron-right').removeClass('rotate90');
            });
            $(".tour-menu").each(function() {
                $(this).slideUp();
            });
            $(this).addClass('active');
            $(this).find('.tour-menu').slideDown();
            $(this).find('.typcn-chevron-right').addClass('rotate90');
        }
        /*
            If active and showing
            only hide the one clicked
         */
        else{
            $(this).find('.tour-menu').slideUp();
            $(this).removeClass('active');
            $(this).find('.typcn-chevron-right').removeClass('rotate90');
        }
    });

    $('.media-opt').on('click',function(){
        createMediaOptionsWindow($(this));
    });
});

function createMediaOptionsWindow(e){

    $('body').find('.media-info-box').each(function() {
        $(this).remove();
    });
    $('body').find('.fadeBG').each(function() {
        $(this).remove();
    });

    var $mediabox = $('<div>',{class:"media-info-box"});
    var $topbar = $('<div>',{class:"top-bar"});
    var $btnAbort = $('<button>',{class:"btn",text:"Avbryt"});
    var $header = $('<div>',{class:"header-text"});
    var $p = $('<p>',{class:"small-text",text:"namnpåfil.jpg"});
    var $btnFinished = $('<button>',{class:"btn right",text:"Klar"});
    var $optionsMenu = $('<div>',{class:"options-menu"});
    var $option1 = $('<div>',{class:"option"});
    var $option2 = $('<div>',{class:"option"});
    var $option3 = $('<div>',{class:"option"});
    var $label1 = $('<label>',{class:"small-text",text:"Panorama"});
    var $radio1 = $('<input>',{type:"radio",name:"options",value:"panorama"});
    var $label2 = $('<label>',{class:"small-text",text:"Visas med kamerabild i bakgrunden"});
    var $radio2 = $('<input>',{type:"radio",name:"options",value:"camera_bg"});
    var $label3 = $('<label>',{class:"small-text",text:"Visas i helskärm"});
    var $radio3 = $('<input>',{type:"radio",name:"options",value:"fullscreen"});

    var $bg = $('<div>',{class:"fadeBG"});

    $btnAbort.on('click',function(){
        $mediabox.remove();
        $bg.remove();
    })

    $header.append($p);
    $topbar.append($btnAbort);
    $topbar.append($header);
    $topbar.append($btnFinished);
    $mediabox.append($topbar);
    $option1.append($label1);
    $option1.append($radio1);
    $option2.append($label2);
    $option2.append($radio2);
    $option3.append($label3);
    $option3.append($radio3);
    $optionsMenu.append($option1)
    $optionsMenu.append($option2)
    $optionsMenu.append($option3)
    $mediabox.append($optionsMenu);

    $bg.appendTo('body').hide().fadeIn(1000);
    $mediabox.appendTo('body');

    var marginLeft = 48
    var marginTop = -6
    $mediabox.css({left: e.offset().left+marginLeft+"px" , top: e.offset().top + marginTop + "px"});
}