$(function() {
    var element;
    var operation;
    var selectUser;
    var selectLang;
    var selectWord;


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
        selectUser = undefined;
        selectLang = undefined;
        selectWord = undefined;

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
        $("#fixedEditMenuSelectUser").off().on("click touchstart", function(e) {
            if ((e.target != this) && (e.target.id)) {
                if (!this[0].id) {this[0].remove();}
                selectUser = e.target;
                selectLang = undefined;
                selectWord = undefined;

                $("#fixedEditMenuSelectWord option").remove();
                $("<option>Words</option>").appendTo("#fixedEditMenuSelectWord");

                fillSelector("languages", e.target.id, "#fixedEditMenuSelectLang");
            }
        });

        // trigger the language selector
        $("#fixedEditMenuSelectLang").off().on("click touchstart", function(e) {
            if ((e.target != this) && (e.target.id)) {
                if (!this[0].id) {this[0].remove();}
                selectLang = e.target;
                selectWord = undefined;
                fillSelector("words", e.target.id, "#fixedEditMenuSelectWord");
            }
        });

        // trigger the word selector
        $("#fixedEditMenuSelectWord").off().on("click touchstart", function(e) {
            if ((e.target != this) && (e.target.id)) {
                if (!this[0].id) {this[0].remove();}
                selectWord = e.target;
            }
        });

        // trigger the submit button on the edit menu form
        $("#fixedEditMenuForm").off().on("submit", function(e) {
            e.preventDefault();

            if (($("#fixedEditMenuSelectUser").length > 0) && (!selectUser)) {
                showMessage("Undefined user", "red");
            } else if (($("#fixedEditMenuSelectLang").length > 0) && (!selectLang)) {
                showMessage("Undefined language", "red");
            } else if (($("#fixedEditMenuSelectWord").length > 0) && (!selectWord)) {
                showMessage("Undefined word", "red");
            } else {
                var data = new Object();
                data.type = $("#"+element).val();

                if (operation === "fixedEditAdd") {
                    switch (element) {
                        case("fixedEditUser"):
                            data.user = $("#fixedEditMenuInputUser").val().trim().toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s\s+/g, ' ');
                            break;
                        case("fixedEditLang"):
                            data.user = selectUser.id;
                            data.language = $("#fixedEditMenuInputLang").val().trim().toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s\s+/g, ' ');
                            break;
                        case("fixedEditWord"):
                            data.language = selectLang.id;
                            data.word = new Array();

                            var words = $("#fixedEditMenuInputWord").val().split("\n");
                            for (var i=0; i<words.length; i++) {
                                data.word[i] = {fields: words[i].split(";")};

                                for (var j=0; j<data.word[i].fields.length; j++) {
                                    data.word[i].fields[j] = data.word[i].fields[j].trim().toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s\s+/g, ' ');
                                }
                            }
                            break;
                    }

                    submitForm(data, "POST");
                } else if (operation === "fixedEditRemove") {
                    switch (element) {
                        case("fixedEditUser"):
                            data.user = selectUser.id;
                            break;
                        case("fixedEditLang"):
                            data.language = selectLang.id;
                            break;
                        case("fixedEditWord"):
                            data.language = selectLang.id;
                            data.word = selectWord.id;
                            break;
                    }

                    submitForm(data, "DELETE");
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
                    
                    for (var i=0; i<res.length; i++) {
                        var fields = "";

                        for (var j=0; j<res[i].fields.length; j++) {
                            fields += res[i].fields[j];
                            if (j != res[i].fields.length-1) {fields += " / ";}
                        }

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