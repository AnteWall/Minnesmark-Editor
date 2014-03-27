/**
 * Created by ante on 2014-03-27.
 */
$('document').ready(function(){

   $('.see-more').on('click',function(e){
       $(".tour-list li").each(function() {
           $(this).removeClass('active');
           $(this).find('.typcn-chevron-right').removeClass('rotate90');
       });
       $(".tour-menu").each(function() {
            $(this).hide();
       });
       $(this).parent().addClass('active');
       $(this).parent().find('.tour-menu').show();
       $(this).parent().find('.typcn-chevron-right').addClass('rotate90');
   });


});
