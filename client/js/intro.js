var introMenu;

$(function() {
    introMenu = new IntroMenu();
    introMenu.show();

    function IntroMenu() {
        this.show = function() {
            $.ajax({
                url: "http://"+serverAddress+":"+serverPort+"/api/info?type=tree",
                method: "GET",
                success: function(res, status) {
                    entriesGenerator(res);
                    delayedLoad();
                },
                error: function(jqXHR, status, err) {
                    if (!err) {
                        showMessage("Unable to connect to server", "red");
                    } else {
                        showMessage(status, "red");
                    }
                }
            });
        }

        var entriesGenerator = function(res) {
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

            $("#introContainer *").remove();
            $(entry).appendTo("#introContainer");
            $("#introContainer").fadeIn(0);
        }
    }

    function delayedLoad() {
        // trigger the languages in the intro menu
        $("#introContainer .introLanguage").off().on("click touchstart", function(e) {
            /*$.ajax({
                //url: "http://"+serverAddress+":"+serverPort+"/api/info?type=words&id=" + e.target.id,
                method: "GET",
                success: function(res, status) {
                    console.log(res);
                },
                error: function(jqXHR, status, err) {
                    if (!err) {
                        showMessage("Unable to connect to server", "red");
                    } else {
                        showMessage(status, "red");
                    }
                }
            });*/
        });
    }
});