"use strict";

$(function() {
    const projectIntroText =    "Application for languages study focused on users adding the languages and content they wish" +
                                " to study, in addition to the period in which they want that content to be distributed.<br>A" +
                                " session is generated daily with the content that users should complete for that day, emphasizing" +
                                " the mistakes made in previous sessions."

    $("<p>" + projectIntroText + "</p>").appendTo("#projectIntroText");

    $(window).on("click touchstart", function(e) {
        if ($("#projectIntroContainer").is(":visible") && ($(e.target).is("#projectIntroContainer") || $(e.target).is("#projectIntroExit"))) {
            $("#projectIntroContainer").fadeOut("slow");
        }
    });
});