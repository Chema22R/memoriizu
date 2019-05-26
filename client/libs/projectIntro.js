"use strict";

document.body.classList.add("noScroll"); // Initial prevent scrolling while project intro is visible


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