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
                    languageTrigger();
                },
                error: function(jqXHR, status, err) {
                    if (!err) {
                        showMessage("Unable to connect to server", "red");
                    } else {
                        showMessage(jqXHR.responseText, "red");
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

        var languageTrigger = function() {
            $("#introContainer .introLanguage").off().on("click touchstart", function(e) {
                $.ajax({
                    url: "http://"+serverAddress+":"+serverPort+"/api/session?language=" + e.target.id,
                    method: "GET",
                    success: function(res, status) {
                        new Session().start(e.target.id, res);
                    },
                    error: function(jqXHR, status, err) {
                        if (!err) {
                            showMessage("Unable to connect to server", "red");
                        } else {
                            showMessage(jqXHR.responseText, "red");
                        }
                    }
                });
            });
        }
    }


    function Session() {
        var session;
        var language;
        var counter;

        this.start = function(lang, words) {
            session = words;
            language = lang;
            counter = 0;
            
            newQuiz();
            
            $("#introContainer, #fixedEditButtons, #fixedStatsButton").fadeOut("fast", function() {
                $("#quizContainer").fadeIn("slow");
            });
            window.onbeforeunload = exitBlocked;
        }

        var newQuiz = function() {
            var fields = session[counter].fields;
            $("#quizTranslate").text(fields[fields.length-1]);
            $("#quizTranslation").val("");
        }

        var newFile = function(state) {
            var fields = session[counter].fields;
            var japaneseRegex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g; // https://gist.github.com/ryanmcgrath/982242
            var entry = "";

            if (japaneseRegex.test(fields[0])) {   // first field
                entry += "<p class='fileTextBig'>" + fields[0] + "</p>";
            } else {
                entry += "<p class='fileTextMed'>" + fields[0] + "</p>";
            }

            for (var i=1; i<fields.length; i++) {   // rest fields
                entry += "<p>" + fields[i] + "</p>";
            }

            $("#fileText p").remove();
            $(entry).appendTo("#fileText");

            if (state) {
                $("#fileButtonRight").fadeIn(0);
                $("#fileButtonWrong").fadeIn(0);
                $("#fileButtonContinue").fadeOut(0);
            } else {
                $("#fileButtonRight").fadeOut(0);
                $("#fileButtonWrong").fadeOut(0);
                $("#fileButtonContinue").fadeIn(0);
            }

            $("#quizContainer").fadeOut(0, function() {
                $("#fileContainer").fadeIn(0);
            });
        }

        var next = function() {
            if (++counter == session.length) {
                $("#fileContainer").fadeOut("fast", function() {
                    $("#introContainer, #fixedEditButtons, #fixedStatsButton").fadeIn("slow");
                });
                window.onbeforeunload = exitUnblocked;
            } else {
                newQuiz();

                $("#fileContainer").fadeOut(0, function() {
                    $("#quizContainer").fadeIn(0);
                });
            }
        }

        var exitBlocked = function() {return "";}
        var exitUnblocked = function() {}


        $("#quizForm").off().on("submit", function(e) {
            e.preventDefault();

            var fields = session[counter].fields.slice(0, session[counter].fields.length-1); // ignoring the last one
            var input = $("#quizTranslation").val().trim().toLowerCase().replace(/\s\s+/g, " ");

            /*for (var i=0; i<fields; i++) {

            }*/

            if (fields.indexOf(input) != -1) {
                newFile(true);
            } else {
                newFile(false);
            }
        });

        $("#fileButtons button").off().on("click touchstart", function(e) {
            e.preventDefault();

            var state;

            if (e.target.id == "fileButtonRight") {
                state = true;
            } else {
                state = false;
                session[session.length] = session[counter];
            }

            if (counter == session.indexOf(session[counter])) {
                $.ajax({
                    url: "http://"+serverAddress+":"+serverPort+"/api/session?language=" + language + "&word=" + session[counter]._id + "&state=" + state,
                    method: "POST",
                    success: function(res, status) {
                        next();
                    },
                    error: function(jqXHR, status, err) {
                        if (!err) {
                            showMessage("Unable to connect to server", "red");
                        } else {
                            showMessage(jqXHR.responseText, "red");
                        }
                    }
                });
            } else {
                next();
            }
        });
    }
});