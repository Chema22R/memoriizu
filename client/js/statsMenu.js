$(function() {
    var selectUser;
    var selectLang;


    /* Stats Buttons
    ========================================================================== */

    // trigger the button to open the stats menu
    $("#fixedStatsButton").on("click touchstart", function() {showStatsMenu();});

    // trigger the user selector
    $("#fixedStatsMenuSelectUser").off().on("click touchstart", function(e) {
        if ((e.target != this) && (e.target.id)) {
            if (!this[0].id) {this[0].remove();}
            selectUser = e.target;
            selectLang = undefined;
            fillSelector("languages", e.target.id, "#fixedStatsMenuSelectLang");
        }
    });

    // trigger the language selector
    $("#fixedStatsMenuSelectLang").off().on("click touchstart", function(e) {
        if ((e.target != this) && (e.target.id)) {
            if (!this[0].id) {this[0].remove();}
            selectLang = e.target;
        }
    });

    // trigger the submit button on the stats menu form
    $("#fixedStatsMenuForm").on("submit", function(e) {
        e.preventDefault();
        
        if (($("#fixedStatsMenuSelectUser").length > 0) && (!selectUser)) {
            showMessage("Undefined user", "red");
        } else if (($("#fixedStatsMenuSelectLang").length > 0) && (!selectLang)) {
            showMessage("Undefined language", "red");
        } else {
            submitForm(selectLang.id);
        }
    });



    /* Stats Menu
    ========================================================================== */

    function showStatsMenu() {
        selectUser = undefined;
        selectLang = undefined;

        fillSelector("users", "", "#fixedStatsMenuSelectUser");
        $("#fixedStatsMenuSelectLang option").remove();
        $("<option>languages</option>").appendTo("#fixedStatsMenuSelectLang");

        $("#fixedStatsMenu").css({left: (window.innerWidth - $("#fixedStatsMenu").width()) / 2});

        $("#fixedLeftover").fadeIn("slow");
        $("#fixedStatsMenu").fadeIn("slow");

        document.getElementById("fixedStatsMenu").scrollTo(0, 0);
    }

    function fillSelector(type, id, selector) {
        $.ajax({
            url: "http://"+serverAddress+":"+serverPort+"/api/info?type=" + type + "&id=" + id,
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
            url: "http://"+serverAddress+":"+serverPort+"/api/info?type=words&id="+language,
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
        var regexpSort = /<em>|<\/em>|([¡!¿?/|"'(){}<>@#$%^&*ºª=+·.,;:_\\\[\]\-\s\t\v])/ig;
        var info =  "<h3>" + language.dictionary.length + " words</h3>"+
                    "<h3>" + language.period.current + "/" + ++language.period.length + " sessions</h3>"+
                    "<h3>" + new Date(language.session.date).toLocaleDateString() + "</h3>"+
                    "<h3>" + new Date(language.date).toLocaleDateString() + "</h3>";
        var table = "<tr><th class='alignLeft'>Fields</th><th>Count</th><th>Countdown</th><th>Completed</th></tr>";

        language.dictionary.sort(function(a, b){
            var a=a.fields[a.fields.length-1].toLowerCase().replace(regexpSort, "");
            var b=b.fields[b.fields.length-1].toLowerCase().replace(regexpSort, "");
            if (!isNaN(a) && !isNaN(b)) {
                return Number(a)>Number(b);
            } else {
                return a.localeCompare(b);
            }
        });

        for (var i=0; i<language.dictionary.length; i++) {
            table += "<tr>";

            table += "<td class='alignLeft'>";
            for (var j=language.dictionary[i].fields.length-1; j; j--) {
                table += language.dictionary[i].fields[j] + " <strong>&#92;</strong> ";
            }
            table += language.dictionary[i].fields[0] + "</td>";

            table +=    "<td>" + language.dictionary[i].count.correct + "/" + language.dictionary[i].count.wrong + "</td>"+
                        "<td>" + language.dictionary[i].countdown.new + "/" + language.dictionary[i].countdown.wrong + "</td>"+
                        "<td>" + language.dictionary[i].ref + "</td>";

            table += "</tr>";
        }

        $("#fixedStatsMenuLanguage").text(selectLang.value);

        $("#fixedStatsMenuInfo02 h3").remove();
        $("#fixedStatsMenuTable tr").remove();
        $(info).appendTo("#fixedStatsMenuInfo02");
        $(table).appendTo("#fixedStatsMenuTable");

        $("#fixedStatsMenu").animate({
            scrollTop: $("#fixedStatsMenuLanguage").position().top
        }, 1000);
    }
});