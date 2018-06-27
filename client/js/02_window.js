$(function() {
    $(window).on("click touchstart", function(e) {
        // edit buttons (close buttons)
        if ($("#fixedEditSubButtons").is(":visible") && !$(e.target).is("#fixedEditButtons *")) {
            $("#fixedEditSubSubButtons, #fixedEditSubButtons").fadeOut("slow");
        }

        // edit menu (close the menu)
        if ($("#fixedEditMenu").is(":visible") && (!$(e.target).is("#fixedEditMenu, #fixedEditMenu *, #fixedEditButtons *") || $(e.target).is(".exitButton"))) {
            $("#fixedLeftover, #fixedEditMenu").fadeOut("slow");
        }

        // stats menu (close the menu)
        if ($("#fixedStatsMenu").is(":visible") && (!$(e.target).is("#fixedStatsMenu, #fixedStatsMenu *, #fixedStatsButton") || $(e.target).is(".exitButton"))) {
            $("#fixedLeftover, #fixedStatsMenu").fadeOut("slow");
        }
    });

    $(window).on("resize", function() {
        // edit menu (center it on the window)
		$("#fixedEditMenu").css({
            left: (window.innerWidth - $("#fixedEditMenu").width()) / 2
        });

        // stats menu (center it on the window)
		$("#fixedStatsMenu").css({
            left: (window.innerWidth - $("#fixedStatsMenu").width()) / 2
        });

        $(".scroll").perfectScrollbar("update");
	});
});