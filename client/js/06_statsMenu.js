$(function() {
    var selected = "#fixedStatsMenuForm option:selected";

    /* Stats Buttons
    ========================================================================== */

    // trigger the button to open the stats menu
    $("#fixedStatsButton").on("click", function() {showStatsMenu();});

    // trigger the user selector
    $("#fixedStatsMenuSelectUser").off().on("change", function() {
        if ($(selected)[0].id) {
            if (!this[0].id) {this[0].remove();}
            fillSelector("languages", $(selected)[0].id, "#fixedStatsMenuSelectLang");
        }
    });

    // trigger the language selector
    $("#fixedStatsMenuSelectLang").off().on("change", function(e) {
        if ($(selected)[1].id) {
            if (!this[0].id) {this[0].remove();}
        }
    });

    // trigger the submit button on the stats menu form
    $("#fixedStatsMenuForm").off().on("submit", function(e) {
        e.preventDefault();

        var selection = $(selected);
        
        if (!selection[0].id) {
            showMessage("Undefined user", "red");
        } else if (!selection[1].id) {
            showMessage("Undefined language", "red");
        } else {
            submitForm(selection[1].id);
        }
    });


    /* Stats Menu
    ========================================================================== */

    function showStatsMenu() {
        fillSelector("users", "", "#fixedStatsMenuSelectUser");
        $("#fixedStatsMenuSelectLang option").remove();
        $("<option>languages</option>").appendTo("#fixedStatsMenuSelectLang");

        $("#fixedStatsMenu").css({left: (window.innerWidth - $("#fixedStatsMenu").width()) / 2});

        $("#fixedLeftover").fadeIn("slow");
        $("#fixedStatsMenu").fadeIn("slow");

        setTimeout(function() {
            $("#fixedStatsMenu").scrollTop(0);
            $(".scroll").perfectScrollbar("update");
        }, 10);
    }

    function fillSelector(type, id, selector) {
        $.ajax({
            url: serverAddress+"/info?type=" + type + "&id=" + id,
            method: "GET",
            success: function(res, status) {
                var options = "<option>" + type + "</option>";
                
                for (var i=0; i<res.length; i++) {
                    options += "<option id='" + res[i]._id + "' value='" + res[i].name + "'>" + res[i].name  + "</option>";
                }

                $(selector + " option").remove();
                $(options).appendTo(selector);
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

    function submitForm(language) {
        $.ajax({
            url: serverAddress+"/info?type=words&id="+language,
            method: "GET",
            success: function(res, status) {
                fillTable(res);
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

    function fillTable(language) {
        var regexSpecials = /(<[A-Z\/]*>|[¡!¿?/|"'(){}<>@#$%^&*ºª=+·.,;:_\\\[\]\-\s\t\v])/ig;
        var regexLetters = /[A-Záàäâãåąæāéèëêęėēíïìîįīóòöôõøœōúüùûū]/ig;
        var regexNumbsVocals = /([0-9áàäâãåąæāéèëêęėēíïìîįīóòöôõøœōúüùûū])/ig;
        var info =  "<h3>" + language.dictionary.length + " words</h3>"+
                    "<h3>" + language.period.current + "/" + ++language.period.length + " sessions</h3>"+
                    "<h3>" + new Date(language.session.date).toLocaleDateString() + "</h3>"+
                    "<h3>" + new Date(language.date).toLocaleDateString() + "</h3>";
        var table = "<tr><th class='alignLeft' title='Fields column shows all the translation data of each word entered during its creation'>Fields</th>"+
                    "<th title='Count column shows the hits and fails of each word'>Count</th>"+
                    "<th title='Countdown column shows two special counts to solve each word in following consecutive sessions for being a new and/or failed word'>Countdown</th>"+
                    "<th title='Completed column shows if each word is completed in the current period of sessions'>Completed</th></tr>";
        var letterSeparator;

        language.dictionary.sort(function(a, b){
            var a=a.fields[a.fields.length-1].toLowerCase().replace(regexSpecials, "");
            var b=b.fields[b.fields.length-1].toLowerCase().replace(regexSpecials, "");
            if (!isNaN(a.substring(0,1)) && !isNaN(b.substring(0,1))) {
                return a.replace(regexLetters, "") - b.replace(regexLetters, "");
            } else {
                return a.localeCompare(b);
            }
        });

        for (var i=0; i<language.dictionary.length; i++) {
            var firstLetter = language.dictionary[i].fields[language.dictionary[i].fields.length-1].replace(regexSpecials, "").substring(0, 1).replace(regexNumbsVocals, "");
            if ((firstLetter != letterSeparator) && (firstLetter != "")) {
                letterSeparator = firstLetter;
                table += "<tr><td class='alignLeft letterSeparator " + letterSeparator.toLowerCase() + " " + letterSeparator.toUpperCase() + "' colspan='4'>" + letterSeparator + "</td></tr>";
            }

            table +=    "<tr><td class='alignLeft'>";
            for (var j=language.dictionary[i].fields.length-1; j; j--) {
                table += language.dictionary[i].fields[j] + " <strong>&#92;</strong> ";
            }
            table += language.dictionary[i].fields[0] + "</td>";

            table +=    "<td title='" + language.dictionary[i].count.correct + " hits&NewLine;" + language.dictionary[i].count.wrong + " failures'>" + language.dictionary[i].count.correct + "/" + language.dictionary[i].count.wrong + "</td>"+
                        "<td title='" + language.dictionary[i].countdown.new + " following consecutive sessions in which to solve for being a new word&NewLine;" + language.dictionary[i].countdown.wrong + " following consecutive sessions in which to solve for being a failed word'>" + language.dictionary[i].countdown.new + "/" + language.dictionary[i].countdown.wrong + "</td>";

            if (language.dictionary[i].ref) {
                table +=    "<td title='Word already completed in the current period of sessions'>" + language.dictionary[i].ref + "</td>";
            } else {
                table +=    "<td title='Word not yet completed in the current period of sessions'>" + language.dictionary[i].ref + "</td>";
            }

            table +=    "</tr>";
        }

        $("#fixedStatsMenuLanguage").text($("#fixedStatsMenuSelectLang").val());

        $("#fixedStatsMenuInfo02 h3").remove();
        $("#fixedStatsMenuTable tr").remove();
        $(info).appendTo("#fixedStatsMenuInfo02");
        $(table).appendTo("#fixedStatsMenuTable");

        $("#fixedStatsMenuInfo").show();
        $("#fixedStatsMenuTable").show();

        $("#fixedStatsMenu").animate({
            scrollTop: $("#fixedStatsMenuLanguage").position().top
        }, 1000);

        keyDetector();
    }

    function keyDetector() {
        $(document).off("keydown").keydown(function(e) {
            if ($("#fixedStatsMenuTable").is(":visible") && (e.which || e.keyCode) >= 65 && (e.which || e.keyCode) <= 90 && $(".letterSeparator." + String.fromCharCode(e.which || e.keyCode)).length) {
                $("#fixedStatsMenu").scrollTop(0).scrollTop($(".letterSeparator." + String.fromCharCode(e.which || e.keyCode)).position().top);
            }
        });
    }
});