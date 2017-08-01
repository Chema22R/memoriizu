$(function() {
    var element;
    var operation;

    /* Triggers (buttons)
    ========================================================================== */

    // open/close submenu
    $("#editFixedTrigger").on("mousedown touchstart", function(e) {
        e.preventDefault();

        if ($("#editFixedSubmenu").is(":hidden")) {
            $("#editFixedSubmenu").fadeIn("slow");
        } else {
            $("#editFixedSubsubmenu").fadeOut("slow");
            $("#editFixedSubmenu").fadeOut("slow");
        }
    });

    // open/close and position subsubmenu
    $("#editFixedSubmenu .submenu").on("mousedown touchstart", function(e) {
        e.preventDefault();

        switch (e.target.id) {
            case "editFixedUser":
                $("#editFixedSubsubmenu .subsubmenu").animate({top: "55px"});
                break;
            case "editFixedLang":
                $("#editFixedSubsubmenu .subsubmenu").animate({top: "95px"});
                break;
            case "editFixedWord":
                $("#editFixedSubsubmenu .subsubmenu").animate({top: "135px"});
                break;
        }

        if ($("#editFixedSubsubmenu").is(":hidden")) {
            $("#editFixedSubsubmenu").fadeIn("slow");
        } else if (element == e.target.id) {
            $("#editFixedSubsubmenu").fadeOut("slow");
        }

        element = e.target.id;
    });

    // trigger the edit menu and send the selected values
    $("#editFixedSubsubmenu .subsubmenu").on("mousedown touchstart", function(e) {
        e.preventDefault();

        if ($("#editFixedSubmenu").is(":visible")) {
            $("#editFixedSubsubmenu").fadeOut("slow");
            $("#editFixedSubmenu").fadeOut("slow");
        }

        operation = e.target.id;

        console.log(element + " " + operation);
    });
});