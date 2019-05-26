"use strict";

document.body.classList.add("noScroll"); // Initial prevent scrolling while project intro is visible


/* Project intro message */

const projectIntroText =    "Application for languages study focused on users adding the languages and content they wish" +
                            " to study, in addition to the period in which they want that content to be distributed.<br>A" +
                            " session is generated daily with the content that users should complete for that day, emphasizing" +
                            " the mistakes made in previous sessions.";

document.getElementById("projectIntroText").innerHTML = projectIntroText;


/* Text fade-in animation */

document.getElementById("projectIntroContent").style.maxWidth = document.getElementById("projectIntroImg").offsetWidth + "px";
setTimeout(() => {
    document.getElementById("projectIntroContent").style.maxWidth = "900px";
}, 500);


/* Porject intro fade-out animation */

function fadeOut() {
    document.getElementById("projectIntroContainer").classList.add("fadeOut");
    setTimeout(() => {
        document.getElementById("projectIntroContainer").style.display = "none";
        document.body.classList.remove("noScroll"); // Removes scrolling prevention
    }, 500);
}