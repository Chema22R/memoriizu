function showMessage(msj, color) {
    $("#fixedLogMsj")
    .text(msj)
    .css({
        color: "white",
        background: color
    }).fadeIn("slow", function() {
        setTimeout(function() {
            $("#fixedLogMsj").fadeOut("slow");
        }, 2500);
    });
}