var introMenu;

$(function() {
    introMenu = new IntroMenu();
    introMenu.show();

    function IntroMenu() {
        this.show = function() {
            $.ajax({
                url: serverAddress+"/info?type=tree",
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

            $("#introContainer h2, #introContainer button").remove();
            $(entry).appendTo("#introContainer");
            $("#introContainer").fadeIn(0);

            setTimeout(function() {
                $("#introContainer").scrollTop(0);
                $(".scroll").perfectScrollbar("update");
            }, 10);
        }

        var languageTrigger = function() {
            $("#introContainer .introLanguage").off().on("click", function(e) {
                $.ajax({
                    url: serverAddress+"/session?language=" + e.target.id,
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
        var regexJapChars = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/ig; // https://gist.github.com/ryanmcgrath/982242
        var regexSpecials = /(<[A-Z\/]*>|[¡!¿?/|"'(){}<>@#$%^&*ºª=+·.,;:_\\\[\]\s\t\v])/ig;
        var regexSust = /aa|ii|uu|ee|oo|au|iu|eu|ou/ig;
        var mapSust = {"aa":"ā", "ii":"ī", "uu":"ū", "ee":"ē", "oo":"ō", "au":"ā", "iu":"ī", "eu":"ē", "ou":"ō"};
        var blockNext = false;
        
        var session;
        var language;
        var counter;

        this.start = function(lang, words) {
            session = words;
            language = lang;
            counter = 0;
            
            newQuiz();
            
            $("#introContainer, #fixedEditButtons, #fixedStatsButton").fadeOut("fast", function() {
                $("#quizContainer, #fixedExit, #fixedLoadingBar").fadeIn("slow");
                setTimeout(function() {
                    $("#quizContainer").scrollTop(0);
                    $(".scroll").perfectScrollbar("update");
                    $("#quizTranslation").focus();
                }, 10);
            });

            $("#fixedLoadingBarProgress").css("width", ((counter+1)*100/session.length).toString() + "%");

            window.onbeforeunload = exitBlocked;
        }

        var newQuiz = function() {
            var translate = session[counter].fields[session[counter].fields.length-1];
            var separator = translate.indexOf("(");

            translate = translate.charAt(0).toUpperCase() + translate.substring(1);

            if (separator != -1) {
                $("#quizTranslate").text(translate.substring(0, separator).trim());
                $("#quizDescription").text(translate.substring(separator).trim());
            } else {
                $("#quizTranslate").text(translate.trim());
                $("#quizDescription").text("");
            }

            $("#quizTranslation").val("");
        }

        var newFile = function(state) {
            var fields = session[counter].fields;
            var entry = "";

            if (regexJapChars.test(fields[0]) || regexJapChars.test(fields[0])) {   // first field
                entry += "<p class='fileTextBig'>" + fields[0] + "</p>";
            } else {
                entry += "<p class='fileTextMed'>" + fields[0].charAt(0).toUpperCase() + fields[0].substring(1).trim() + "</p>";
            }

            for (var i=1; i<fields.length; i++) {   // rest fields
                entry += "<p>" + fields[i] + "</p>";
            }

            if (!state) {
                entry += "<p class='fileTextWrong'>" + $("#quizTranslation").val().toLowerCase().trim().replace(regexSust, function(match) {return mapSust[match];}) + "</p>";
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
                setTimeout(function() {
                    $("#fileContainer").scrollTop(0);
                    $(".scroll").perfectScrollbar("update");
                    if (state) {
                        $("#fileButtonRight").focus();
                    } else {
                        $("#fileButtonContinue").focus();
                    }
                }, 10);
            });

            blockNext = true;
            setTimeout(function() {
                blockNext = false;
            }, 1000);
        }

        var next = function(exit) {
            if (++counter == session.length || exit) {
                $("#quizContainer, #fileContainer, #fixedExit, #fixedLoadingBar").fadeOut(0, function() {
                    $("#introContainer, #fixedEditButtons, #fixedStatsButton").fadeIn("slow");
                });
                window.onbeforeunload = exitUnblocked;
            } else {
                newQuiz();

                $("#fileContainer").fadeOut(0, function() {
                    $("#quizContainer").fadeIn(0);
                    setTimeout(function() {
                        $("#quizContainer").scrollTop(0);
                        $(".scroll").perfectScrollbar("update");
                        $("#quizTranslation").focus();
                    }, 10);
                });

                blockNext = true;
                setTimeout(function() {
                    blockNext = false;
                }, 1000);
            }
        }

        var exitBlocked = function() {return "";}
        var exitUnblocked = function() {}


        $("#quizForm").off().on("submit", function(e) {
            e.preventDefault();

            if (!blockNext) {
                var input = $("#quizTranslation").val().toLowerCase().replace(regexSust, function(match) {return mapSust[match];}).replace(regexSpecials, "");
                var fields = session[counter].fields.slice(0, session[counter].fields.length-1); // ignoring the last one
                for (var i=0; i<fields.length; i++) {
                    fields[i] = fields[i].toLowerCase().replace(regexSust, function(match) {return mapSust[match];}).replace(regexSpecials, "");
                }

                if (fields.indexOf(input) != -1) {
                    newFile(true);
                } else {
                    var inputSorted = input.split("").sort().join("");
                    var fieldsSorted = new Array();
                    
                    for (var i=0; i<fields.length; i++) {
                        fieldsSorted[fieldsSorted.length] = fields[i].split("").sort().join("");
                    }

                    if (fieldsSorted.indexOf(inputSorted) != -1) {
                        newFile(true);
                    } else {
                        newFile(false);
                    }
                }
            }
        });

        $("#fileButtons button").off().on("click", function(e) {
            e.preventDefault();

            if (!blockNext) {
                var state;

                if (e.target.id == "fileButtonRight") {
                    state = true;
                    
                    $("#fixedLoadingBarProgress").animate({
                        width: ((counter+2)*100/session.length).toString() + "%"
                    }, 1000);
                } else {
                    state = false;
                    session[session.length] = session[counter];
                }

                if (counter == session.indexOf(session[counter])) {
                    $.ajax({
                        url: serverAddress+"/session?language=" + language + "&word=" + session[counter]._id + "&state=" + state,
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
            }
        });

        $("#fixedExit").off().on("click", function(e) {
            if (confirm("You are leaving without finishing the session, are you sure? You can resume the session later")) {
                next(true);
            }
        });
    }
});