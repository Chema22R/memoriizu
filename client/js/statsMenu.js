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
        console.log(language);
    }
});