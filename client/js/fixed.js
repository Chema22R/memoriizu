$(function() {
    /* Triggers
    ========================================================================== */

    // edit (open/close submenu)
    $("#editFixedTrigger").on("mousedown touchstart", function(e) {
        e.preventDefault();

        if ($("#editFixedSubmenu").is(":hidden")) {
            $("#editFixedSubmenu").fadeIn("slow");
        } else {
            $("#editFixedSubmenu").fadeOut("slow");
        }
    });
});