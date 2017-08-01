$(function() {
    // mousedown touchstart
    $(window).on("mousedown touchstart", function(e) {
        // edit (close submenu)
        if ((!$(e.target).is("#editFixedTrigger")) && ($("#editFixedSubmenu").is(":visible"))) {
            $("#editFixedSubmenu").fadeOut("slow");
        }
    });
});