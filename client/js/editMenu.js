$(function() {
    var element;
    var operation;
    var selected = "#fixedEditMenuForm option:selected";


    /* Edit Buttons
    ========================================================================== */

    // open/close subButtons
    $("#fixedEditTrigger").on("click touchstart", function(e) {
        e.preventDefault();

        if ($("#fixedEditSubButtons").is(":hidden")) {
            $("#fixedEditSubButtons").fadeIn("slow");
        } else {
            $("#fixedEditSubSubButtons").fadeOut("slow");
            $("#fixedEditSubButtons").fadeOut("slow");
        }
    });

    // open/close and position subSubButtons
    $("#fixedEditSubButtons .subButton").on("click touchstart", function(e) {
        e.preventDefault();

        switch (e.target.id) {
            case "fixedEditUser":
                $("#fixedEditSubSubButtons .subSubButton").animate({top: "55px"});
                break;
            case "fixedEditLang":
                $("#fixedEditSubSubButtons .subSubButton").animate({top: "95px"});
                break;
            case "fixedEditWord":
                $("#fixedEditSubSubButtons .subSubButton").animate({top: "135px"});
                break;
        }

        if ($("#fixedEditSubSubButtons").is(":hidden")) {
            $("#fixedEditSubSubButtons").fadeIn("slow");
        } else if (element == e.target.id) {
            $("#fixedEditSubSubButtons").fadeOut("slow");
        }

        element = e.target.id;
    });

    // trigger the subSubButtons to open the edit menu
    $("#fixedEditSubSubButtons .subSubButton").on("click touchstart", function(e) {
        e.preventDefault();

        if ($("#fixedEditSubButtons").is(":visible")) {
            $("#fixedEditSubSubButtons").fadeOut("slow");
            $("#fixedEditSubButtons").fadeOut("slow");
        }

        operation = e.target.id;

        showEditMenu();
    });



    /* Edit Menu
    ========================================================================== */

    function showEditMenu() {
        var form = "";

        form += "<form id='fixedEditMenuForm'>";
        form += "<h2 id='fixedEditMenuTitle'>" + $("#"+operation).val() + " " + $("#"+element).val() + "</h2>";

        if (operation === "fixedEditAdd") {
            switch (element) {
                case("fixedEditUser"):
                    form += "<input id='fixedEditMenuInputUser' type='text' maxlength='20' placeholder='New user' autocomplete='on' required autofocus>";
                    break;
                case("fixedEditLang"):
                    form += "<select id='fixedEditMenuSelectUser' required><option>Users</option></select>";
                    form += "<input id='fixedEditMenuInputLang' type='text' maxlength='20' placeholder='New language' autocomplete='on' required>";
                    form += "<input id='fixedEditMenuInputNumb' type='number' min='1' placeholder='Period length' required>";
                    break;
                case("fixedEditWord"):
                    form += "<select id='fixedEditMenuSelectUser' required><option>Users</option></select>";
                    form += "<select id='fixedEditMenuSelectLang' required><option>Languages</option></select>";
                    form += "<textarea id='fixedEditMenuInputWord' name='textarea' dirname='textarea.dir' placeholder='New words (one word for each line and fields separated with &quot;&semi;&quot;)' required></textarea>";
                    break;
            }
        } else if (operation === "fixedEditRemove") {
            switch (element) {
                case("fixedEditUser"):
                    form += "<select id='fixedEditMenuSelectUser' required><option>Users</option></select>";
                    break;
                case("fixedEditLang"):
                    form += "<select id='fixedEditMenuSelectUser' required><option>Users</option></select>";
                    form += "<select id='fixedEditMenuSelectLang' required><option>Languages</option></select>";
                    break;
                case("fixedEditWord"):
                    form += "<select id='fixedEditMenuSelectUser' required><option>Users</option></select>";
                    form += "<select id='fixedEditMenuSelectLang' required><option>Languages</option></select>";
                    form += "<select id='fixedEditMenuSelectWord' required><option>Words</option></select>";
                    break;
            }
        }

        fillSelector("users", "", "#fixedEditMenuSelectUser");

        form += "<button id='fixedEditMenuSubmit' class='icon-continue icon' type='submit' title='send form'></button>";
        form += "</form>";

        $("#fixedEditMenuForm").remove();
        $(form).appendTo("#fixedEditMenu");

        $("#fixedEditMenu").css({left: (window.innerWidth - $("#fixedEditMenu").width()) / 2});

        $("#fixedLeftover").fadeIn("slow");
        $("#fixedEditMenu").fadeIn("slow");

        delayedLoad();
    }

    function delayedLoad() {
        // trigger the user selector
        $("#fixedEditMenuSelectUser").off().on("change", function(e) {
            if ($(selected)[0].id) {
                if (!this[0].id) {this[0].remove();}
                $("#fixedEditMenuSelectWord option").remove();
                $("<option>Words</option>").appendTo("#fixedEditMenuSelectWord");

                fillSelector("languages", $(selected)[0].id, "#fixedEditMenuSelectLang");
            }
        });

        // trigger the language selector
        $("#fixedEditMenuSelectLang").off().on("change", function(e) {
            if ($(selected)[1].id) {
                if (!this[0].id) {this[0].remove();}
                fillSelector("words", $(selected)[1].id, "#fixedEditMenuSelectWord");
            }
        });

        // trigger the word selector
        $("#fixedEditMenuSelectWord").off().on("change", function(e) {
            if ($(selected)[2].id) {
                if (!this[0].id) {this[0].remove();}
            }
        });

        // trigger the submit button on the edit menu form
        $("#fixedEditMenuForm").off().on("submit", function(e) {
            e.preventDefault();

            var selection = $(selected);

            if ((selection[0]) && (!selection[0].id)) {
                showMessage("Undefined user", "red");
            } else if ((selection[1]) && (!selection[1].id)) {
                showMessage("Undefined language", "red");
            } else if ((selection[2]) && (!selection[2].id)) {
                showMessage("Undefined word", "red");
            } else {
                var data = new Object();
                data.type = $("#"+element).val();

                if (operation === "fixedEditAdd") {
                    switch (element) {
                        case("fixedEditUser"):
                            data.user = $("#fixedEditMenuInputUser").val().trim().toLowerCase().replace(/\s\s+/g, " ");
                            break;
                        case("fixedEditLang"):
                            data.user = selection[0].id;
                            data.language = $("#fixedEditMenuInputLang").val().trim().toLowerCase().replace(/\s\s+/g, " ");
                            data.period = $("#fixedEditMenuInputNumb").val();
                            break;
                        case("fixedEditWord"):
                            data.language = selection[1].id;
                            data.word = new Array();

                            var words = $("#fixedEditMenuInputWord").val().split("\n");
                            for (var i=0; i<words.length; i++) {
                                data.word[i] = {fields: words[i].split(";")};

                                for (var j=0; j<data.word[i].fields.length; j++) {
                                    data.word[i].fields[j] = data.word[i].fields[j].trim().toLowerCase().replace(/\s\s+/g, " ");
                                }
                            }
                            break;
                    }

                    submitForm(data, "POST");
                } else if (operation === "fixedEditRemove") {
                    var msj;

                    switch (element) {
                        case("fixedEditUser"):
                            data.user = selection[0].id;
                            msj = "You are attempting to delete the user '" + selection[0].value + "' and all its content, are you sure?";
                            break;
                        case("fixedEditLang"):
                            data.language = selection[1].id;
                            msj = "You are attempting to delete the language '" + selection[1].value + "' of user '" + selection[0].value + "' and all its content, are you sure?";
                            break;
                        case("fixedEditWord"):
                            data.language = selection[1].id;
                            data.word = selection[2].id;
                            break;
                    }

                    if (element == "fixedEditWord" || confirm(msj)) {
                        submitForm(data, "DELETE");
                    }
                }
            }
        });
    }


    function fillSelector(type, id, selector) {
        $.ajax({
            url: "http://"+serverAddress+":"+serverPort+"/api/info?type=" + type + "&id=" + id,
            method: "GET",
            success: function(res, status) {
                var options = "<option>" + type + "</option>";

                if (type === "words") {
                    res = res.dictionary;

                    res.sort(function(a, b){
                        var regexSpecials = /(<[A-Z\/]*>|[¡!¿?/|"'(){}<>@#$%^&*ºª=+·.,;:_\\\[\]\-\s\t\v])/ig;
                        var regexLetters = /[A-Záàäâãåąæāéèëêęėēíïìîįīóòöôõøœōúüùûū]/ig;
                        var a=a.fields[a.fields.length-1].toLowerCase().replace(regexSpecials, "");
                        var b=b.fields[b.fields.length-1].toLowerCase().replace(regexSpecials, "");
                        if (!isNaN(a.substring(0,1)) && !isNaN(b.substring(0,1))) {
                            return a.replace(regexLetters, "") - b.replace(regexLetters, "");
                        } else {
                            return a.localeCompare(b);
                        }
                    });
                    
                    for (var i=0; i<res.length; i++) {
                        var fields = "";

                        for (var j=res[i].fields.length-1; j; j--) {
                            fields += res[i].fields[j] + " <strong>&#92;</strong> ";
                        }
                        fields += res[i].fields[0];

                        options += "<option id='" + res[i]._id + "' value='" + fields + "'>" + fields  + "</option>";
                    }
                } else {
                    for (var i=0; i<res.length; i++) {
                        options += "<option id='" + res[i]._id + "' value='" + res[i].name + "'>" + res[i].name  + "</option>";
                    }
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

    function submitForm(data, method) {
        $.ajax({
            url: "http://"+serverAddress+":"+serverPort+"/api/info",
            method: method,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(res, status) {
                showMessage(res, "green");
                $("#fixedLeftover").fadeOut("slow");
                $("#fixedEditMenu").fadeOut("slow");
                introMenu.show();
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
});