/* packages
========================================================================== */

var mongoose = require("mongoose");
var fs = require("fs");
var Console = require("console").Console;


/* models
========================================================================== */

var User = require("./../models/user.js");
var Language = require("./../models/language.js");


/* Log
========================================================================== */

if (!fs.existsSync("./log")) {fs.mkdirSync("./log");}

var log = fs.createWriteStream("./log/node.log", {flags: "a"});
var logErr = fs.createWriteStream("./log/error.log", {flags: "a"});
var logger = new Console(log, logErr);


/* API
========================================================================== */

exports.addInfo = function(req, res) {
    console.log("\n> ADDINFO request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    console.time("  ADDINFO request completed");

    if (mongoose.connection.readyState === 1) {
        switch (req.body.type) {
            case "user":
                try {
                    req.body.user = req.body.user.trim().toLowerCase();
                    addUser(req.body.user);
                } catch (err) {
                    res.sendStatus(400);
                    console.error("\n- ERROR ADDINFO field 'user' doesn't exist (" + new Date().toUTCString() + ")");
                    console.timeEnd("  ADDINFO request completed");
                }
                break;
            case "language":
                try {
                    req.body.language = req.body.language.trim().toLowerCase();
                    addLanguage(req.body.user, req.body.language);
                } catch (err) {
                    res.sendStatus(400);
                    console.error("\n- ERROR ADDINFO field 'language' doesn't exist (" + new Date().toUTCString() + ")");
                    console.timeEnd("  ADDINFO request completed");
                }
                break;
            case "word":
                try {
                    req.body.word.length;  // does nothing, just checks existence
                    addWord(req.body.language, req.body.word);
                } catch (err) {
                    res.sendStatus(400);
                    console.error("\n- ERROR ADDINFO field 'word' doesn't exist (" + new Date().toUTCString() + ")");
                    console.timeEnd("  ADDINFO request completed");
                }
                break;
            default:
                res.sendStatus(400);
                console.error("\n- ERROR ADDINFO unknown type '" + req.body.type + "' (" + new Date().toUTCString() + ")");
                console.timeEnd("  ADDINFO request completed");
        }
    } else {
        res.sendStatus(500);
        console.error("\n- ERROR ADDINFO database disconnected (" + new Date().toUTCString() + ")");
        console.timeEnd("  ADDINFO request completed");
    }
    

    function addUser(user) {
        console.log("    Checking user dublicity...");

        User.find({
            name: user
        }, {}, function (err, query) {
            if (err) {
                res.sendStatus(500);
                console.error("\n- ERROR ADDINFO at checking user '" + user + "' dublicity (" + new Date().toUTCString() + "):\n    " + err.message);
                console.timeEnd("  ADDINFO request completed");
            } else if (query.length > 0) {
                res.sendStatus(400);
                console.log("      User '" + user + "' already exists");
                console.timeEnd("  ADDINFO request completed");
            } else {
                console.log("      User '" + user + "' is available");
                console.log("    Adding user to database...");

                User.create({
                    name: user
                }, function(err, query) {
                    if (err) {
                        res.sendStatus(500);
                        console.error("\n- ERROR ADDINFO at adding user '" + user + "' to database (" + new Date().toUTCString() + "):\n    " + err.message);
                    } else {
                        res.sendStatus(200);
                        console.log("      User '" + user + "' added correctly");
                    }

                    console.timeEnd("  ADDINFO request completed");
                });
            }
        });
    }


    function addLanguage(user, language) {
        console.log("    Checking user existence...");

        User.findById(user, function (err, query) {
            if (err) {
                res.sendStatus(500);
                console.error("\n- ERROR ADDINFO at checking user '" + user + "' existence (" + new Date().toUTCString() + "):\n    " + err.message);
                console.timeEnd("  ADDINFO request completed");
            } else if (query === null) {
                res.sendStatus(400);
                console.error("\n- ERROR ADDINFO user '" + user + "' doesn't exist (" + new Date().toUTCString() + ")");
                console.timeEnd("  ADDINFO request completed");
            } else {
                console.log("      Existence of user '" + user + "' confirmed");
                console.log("    Checking language dublicity...");

                var check = false;

                for (var i=0; i<query.languages.length && check==false; i++) {
                    if (query.languages[i].name === language) {
                        check = true;
                        res.sendStatus(400);
                        console.log("      Language '" + language + "' already linked with user '" + user + "'");
                        console.timeEnd("  ADDINFO request completed");
                    }
                }

                if (check == false) {
                    console.log("      Language '" + language + "' is available");
                    console.log("    Adding language to database...");

                    Language.create({
                        name: language,
                        user: user
                    }, function(err, query) {
                        if (err) {
                            res.sendStatus(500);
                            console.error("\n- ERROR ADDINFO at adding language '" + language + "' to database (" + new Date().toUTCString() + "):\n    " + err.message);
                            console.timeEnd("  ADDINFO request completed");
                        } else {
                            console.log("      Language '" + language + "' added correctly");
                            console.log("    Linking user and new language...");
                            
                            User.findByIdAndUpdate(user, {
                                $push: {"languages": query}
                            }, {}, function (err, query) {
                                if (err) {
                                    res.sendStatus(500);
                                    console.error("\n- ERROR ADDINFO at linking language '" + language + "' with user '" + query.name + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                                } else {
                                    res.sendStatus(200);
                                    console.log("      Language '" + language + "' linked with user '" + query.name +"'");
                                }

                                console.timeEnd("  ADDINFO request completed");
                            });
                        }
                    });
                }
            }
        });
    }


    function addWord(language, words) {
        console.log("    Checking language existence...");

        Language.findById(language, function(err, query) {
            if (err) {
                res.sendStatus(500);
                console.error("\n- ERROR ADDINFO at checking language '" + language + "' existence (" + new Date().toUTCString() + "):\n    " + err.message);
                console.timeEnd("  ADDINFO request completed");
            } else if (query === null) {
                res.sendStatus(400);
                console.error("\n- ERROR ADDINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                console.timeEnd("  ADDINFO request completed");
            } else {
                console.log("      Language existence confirmed");
                console.log("    Adding " + words.length + " words to language '" + language + "'");

                for (var i=0; i<words.length; i++) {
                    Language.findByIdAndUpdate(language, {
                        $push: {"dictionary": words[i]}
                    }, function(err, query) {
                        if (err) {
                            console.error("\n- ERROR ADDINFO at adding word to language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                        }
                    });
                }
                
                res.sendStatus(200);
                console.timeEnd("  ADDINFO request completed");
            }
        });
    }
};


exports.delInfo = function(req, res) {
    console.log("\n> DELETEINFO request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    console.time("  DELETEINFO request completed");

    if (mongoose.connection.readyState === 1) {
        switch (req.body.type) {
            case "user":
                delUser(req.body.user);
                break;
            case "language":
                delLanguage(req.body.language);
                break;
            case "word":
                delWord(req.body.language, req.body.word);
                break;
            default:
                res.sendStatus(400);
                console.error("\n- ERROR DELETEINFO unknown type '" + req.body.type + "' (" + new Date().toUTCString() + ")");
                console.timeEnd("  DELETEINFO request completed");
        }
    } else {
        res.sendStatus(500);
        console.error("\n- ERROR DELETEINFO database disconnected (" + new Date().toUTCString() + ")");
        console.time("  DELETEINFO request completed");
    }


    function delUser(user) {
        console.log("    Removing user from database...");

        User.findByIdAndRemove(user, function(err, query) {
            if (err) {
                res.sendStatus(500);
                console.error("\n- ERROR DELETEINFO at removing user '" + user + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                console.timeEnd("  DELETEINFO request completed");
            } else if (query === null) {
                res.sendStatus(400);
                console.error("\n- ERROR DELETEINFO user '" + user + "' doesn't exist (" + new Date().toUTCString() + ")");
                console.timeEnd("  DELETEINFO request completed");
            } else {
                console.log("      User '" + user + "' removed");
                console.log("    Removing " + query.languages.length + " languages from user '" + user + "'");
                
                for (var i=0; i<query.languages.length; i++) {
                    Language.findByIdAndRemove(query.languages[i]._id, function(err, query) {
                        if (err) {
                            console.error("\n- ERROR DELETEINFO at removing languages of user '" + user + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                        }
                    });
                }

                res.sendStatus(200);
                console.timeEnd("  DELETEINFO request completed");
            }
        });
    }


    function delLanguage(language) {
        console.log("    Removing language from database...");

        Language.findByIdAndRemove(language, function(err, query) {
            if (err) {
                res.sendStatus(500);
                console.error("\n- ERROR DELETEINFO at removing language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                console.timeEnd("  DELETEINFO request completed");
            } else if (query === null) {
                res.sendStatus(400);
                console.error("\n- ERROR DELETEINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                console.timeEnd("  DELETEINFO request completed");
            } else {
                console.log("      Language '" + language + "' removed");
                console.log("    Removing user link with language...");

                User.findByIdAndUpdate(query.user, {
                    $pull: {"languages": {"_id": language}}
                }, {},function (err, query) {
                    if (err) {
                        res.sendStatus(500);
                        console.error("\n- ERROR DELETEINFO at removing link with language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                    } else {
                        res.sendStatus(200);
                        console.log("      User link with language '" + language + "' removed");
                    }

                    console.timeEnd("  DELETEINFO request completed");
                });
            }
        });
    }


    function delWord(language, word) {
        console.log("    Checking language existence...");

        Language.findById(language, function(err, query) {
            if (err) {
                res.sendStatus(500);
                console.error("\n- ERROR DELETEINFO at checking language '" + language + "' existence (" + new Date().toUTCString() + "):\n    " + err.message);
                console.timeEnd("  DELETEINFO request completed");
            } else if (query === null) {
                res.sendStatus(400);
                console.error("\n- ERROR DELETEINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                console.timeEnd("  DELETEINFO request completed");
            } else {
                console.log("      Language existence confirmed");
                console.log("    Removing word from language...");

                Language.findByIdAndUpdate(language, {
                    $pull: {"dictionary": {"_id": word}}
                }, function(err, query) {
                    if (err) {
                        res.sendStatus(500);
                        console.error("\n- ERROR DELETEINFO at removing word '" + word + "' from language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                    } else {
                        res.sendStatus(200);
                        console.log("      Word '" + word + "' removed from language '" + language + "'");
                    }

                    console.timeEnd("  DELETEINFO request completed");
                });
            }
        });
    }
};


exports.getInfo = function(req, res) {
    console.log("\n> GETINFO request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    
    if (mongoose.connection.readyState === 1) {
        console.log("    Getting users list...");

        User.find({}, {
            name: 1,
            languages: 1
        }, function (err, query) {
            if (err) {
				res.sendStatus(500);
				console.error("\n- ERROR GETINFO at getting info from database (" + new Date().toUTCString() + "):\n    " + err.message);
			} else {
                console.log("      Users list obtained (" + query.length + " elements)");
				res.json(query);
            }

            console.log("  GETINFO request completed");
        });
    } else {
        res.sendStatus(500);
        console.error("\n- ERROR GETINFO database disconnected (" + new Date().toUTCString() + ")");
        console.log("  GETINFO request completed");
    }
};