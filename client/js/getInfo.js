$(function() {
    $.ajax({
        url: "http://"+serverAddress+":"+serverPort+"/api/info",
        method: "GET",
        success: function(res, status) {
            entriesGenerator(res);
        },
        error: function(jqXHR, status, err) {
            if (!err) {
                //showMessage("Unable to connect to server", "red");
            } else {
                //showMessage(jqXHR.responseText, "red");
            }
        }
    });

    function entriesGenerator(res) {
        console.log(res);

        for (var i=0; i<res.length; i++) {
            console.log(res[i].name);

            for (var j=0; j<res[i].languages.length; j++) {
                console.log(res[i].languages[j]);
            }
        }
    }
});