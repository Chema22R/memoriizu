$(function() {
    $.ajax({
        url: "http://"+serverAddress+":"+serverPort+"/api/info",
        method: "GET",
        crossDomain: true,
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
        alert(res);
    }
});