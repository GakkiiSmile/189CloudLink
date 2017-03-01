var Script = function () {

	jQuery('.sidebar .item.vertical > a').click(function () {
        var ver = jQuery(this).next();
        if (ver.is(":visible")) {
            jQuery(this).parent().removeClass("open");
            ver.slideUp(200);
        } else {
            jQuery(this).parent().addClass("open");
            ver.slideDown(200);
        }
    });

	$(function() {
        function responsiveView() {
            var wSize = $(window).width();
            if (wSize <= 768) {
                $('.main').addClass('sidebar-close');
                $('.sidebar .sidebar-menu').hide();
            }

            if (wSize > 768) {
                $('.main').removeClass('sidebar-close');
                $('.sidebar .sidebar-menu').show();
            }
        }
        $(window).on('load', responsiveView);
        $(window).on('resize', responsiveView);
    });

    $('.sidebar-toggle').click(function () {
        if ($('.sidebar .sidebar-menu').is(":visible") === true) {
            $('.main-content').css({
                'margin-left': '0px'
            });
            $('.sidebar').css({
                'margin-left': '-180px'
            });
            $('.sidebar .sidebar-menu').hide();
            $(".main").addClass("sidebar-closed");
        } else {
            $('.main-content').css({
                'margin-left': '180px'
            });
            $('.sidebar .sidebar-menu').show();
            $('.sidebar').css({
                'margin-left': '0'
            });
            $(".main").removeClass("sidebar-closed");
        }
    });

}();