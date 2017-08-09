$(function() {
    // click touchstart
    $(window).on("click touchstart", function(e) {
        // edit buttons (close buttons)
        if ((!$(e.target).is("#fixedEditButtons *")) && ($("#fixedEditSubButtons").is(":visible"))) {
            $("#fixedEditSubSubButtons").fadeOut("slow");
            $("#fixedEditSubButtons").fadeOut("slow");
        }

        // edit menu (close the menu)
        if ((!$(e.target).is("#fixedEditMenu, #fixedEditMenu *, #fixedEditButtons *")) && ($("#fixedEditMenu").is(":visible"))) {
            $("#fixedLeftover").fadeOut("slow");
            $("#fixedEditMenu").fadeOut("slow");
        }

        // stats menu (close the menu)
        if ((!$(e.target).is("#fixedStatsMenu, #fixedStatsMenu *, #fixedStatsButton")) && ($("#fixedStatsMenu").is(":visible"))) {
            $("#fixedLeftover").fadeOut("slow");
            $("#fixedStatsMenu").fadeOut("slow");
        }
    });

    // resize
    $(window).on("resize", function() {
        // edit menu (center it on the window)
		$("#fixedEditMenu").css({
            left: (window.innerWidth - $("#fixedEditMenu").width()) / 2
        });

        // stats menu (center it on the window)
		$("#fixedStatsMenu").css({
            left: (window.innerWidth - $("#fixedStatsMenu").width()) / 2
        });
	});
});