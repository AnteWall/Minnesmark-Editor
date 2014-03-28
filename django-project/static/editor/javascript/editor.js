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


});
