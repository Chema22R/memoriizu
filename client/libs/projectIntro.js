"use strict";

{
    document.body.classList.add("noScroll");

    document.getElementById("projectIntroContent").style.maxWidth = document.getElementById("projectIntroImg").offsetWidth + "px";
    document.getElementById("projectIntroText").style.display = "unset";

    setTimeout(() => {
        document.getElementById("projectIntroContent").style.maxWidth = "900px";
    }, 500);
}


function projectIntrofadeIn() {
    document.body.classList.add("noScroll");

    document.getElementById("projectIntroContainer").style.display = "flex";
    document.getElementById("projectIntroText").scrollTop = 0;

    setTimeout(() => {
        document.getElementById("projectIntroContainer").style.opacity = 1;
    }, 50);
}


function projectIntrofadeOut() {
    document.getElementById("projectIntroContainer").style.opacity = 0;

    setTimeout(() => {
        document.getElementById("projectIntroContainer").style.display = "none";
        document.body.classList.remove("noScroll");
    }, 500);
}