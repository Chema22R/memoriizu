$(function() {
    $.ajax({
        url: "http://"+serverAddress+":"+serverPort+"/api/info",
        method: "GET",
        success: function(res, status) {
            entriesGenerator(res);
        },
        error: function(jqXHR, status, err) {
            if (!err) {
                showMessage("Unable to connect to server", "red");
            } else {
                showMessage(status, "red");
            }
        }
    });


    /* Functions
    ========================================================================== */

    function entriesGenerator(res) {
        var entry = "";

        for (var i=0; i<res.length; i++) {
            entry += "<h2 id='" + res[i]._id + "' class='introUser' title='user " + res[i].name + "'>" + res[i].name + "</h2>";

            for (var j=0; j<res[i].languages.length; j++) {
                entry += "<button id='" + res[i].languages[j]._id + "' class='introLanguage' title='language " + res[i].languages[j].name + "'>" + res[i].languages[j].name + "</button>";
            }
        }

        if (entry === "") {
            entry = ("<h2 class='noInfo' title='no info to display'>No information to display</h2>");
        }

        $(entry).appendTo("#introContainer");
        $("#introContainer").fadeIn(0);
    }


    function showMessage(msj, color) {
		$("#logFixedMsj")
		.text(msj)
		.css({
			color: "white",
			background: color
		}).fadeIn("slow", function() {
			setTimeout(function() {
				$("#logFixedMsj").fadeOut("slow");
			}, 2500);
		});
	}
});