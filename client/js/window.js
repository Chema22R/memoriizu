$(function() {
    // mousedown touchstart
    $(window).on("mousedown touchstart", function(e) {
        // edit menu (close the entire menu)
        if ((!$(e.target).is("#editFixed *")) && ($("#editFixedSubmenu").is(":visible"))) {
            $("#editFixedSubsubmenu").fadeOut("slow");
            $("#editFixedSubmenu").fadeOut("slow");
        }
    });
});