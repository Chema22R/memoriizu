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

exports.getInfo = function(req, res) {
    logger.log("\n> GETINFO request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    logger.time("  GETINFO request completed");
    
    if (mongoose.connection.readyState === 1) {
        switch (req.query.type) {
            case "tree": getTree();break;
            case "users": getUsers();break;
            case "languages": getLanguages(req.query.id);break;
            case "words": getWords(req.query.id);break;
            default:
                logger.error("\n- ERROR GETINFO unknown type '" + req.query.type + "' (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  GETINFO request completed");
        }
    } else {
        logger.error("\n- ERROR GETINFO database disconnected (" + new Date().toUTCString() + ")");
        res.sendStatus(500);
        logger.log("  GETINFO request completed");
    }


    function getTree() {
        logger.log("    Getting tree info...");

        User.find({}, {
            _id: 1,
            name: 1,
            languages: 1
        }, function (err, query) {
            if (err) {
				logger.error("\n- ERROR GETINFO at getting tree info from database (" + new Date().toUTCString() + "):\n    " + err.message);
				res.sendStatus(500);
			} else {
                logger.log("      Tree info obtained (" + query.length + " users)");
				res.json(query);
            }

            logger.log("  GETINFO request completed");
        });
    }


    function getUsers() {
        logger.log("    Getting users list...");

        User.find({}, {
            _id: 1,
            name: 1
        }, function (err, query) {
            if (err) {
				logger.error("\n- ERROR GETINFO at getting users list from database (" + new Date().toUTCString() + "):\n    " + err.message);
				res.sendStatus(500);
			} else {
                logger.log("      Users list obtained (" + query.length + " elements)");
				res.json(query);
            }

            logger.log("  GETINFO request completed");
        });
    }


    function getLanguages(user) {
        logger.log("    Getting languages list...");

        User.findById(user, {
            languages: 1
        }, function (err, query) {
            if (err) {
				logger.error("\n- ERROR GETINFO at getting languages list from user '" + user + "' (" + new Date().toUTCString() + "):\n    " + err.message);
				res.sendStatus(500);
			} else if (query === null) {
                logger.error("\n- ERROR GETINFO user '" + user + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
            } else {
                logger.log("      Languages list obtained from user '" + user + "' (" + query.languages.length + " elements)");
				res.json(query.languages);
            }

            logger.log("  GETINFO request completed");
        });
    }


    function getWords(language) {
        logger.log("    Getting words list...");

        Language.findById(language, {
            _id: 1,
            dictionary: 1
        }, function (err, query) {
            if (err) {
				logger.error("\n- ERROR GETINFO at getting words list from language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
				res.sendStatus(500);
			} else if (query === null) {
                logger.error("\n- ERROR GETINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
            } else {
                logger.log("      Words list obtained from language '" + language + "' (" + query.dictionary.length + " elements)");
				res.json(query.dictionary);
            }

            logger.log("  GETINFO request completed");
        });
    }
};


exports.addInfo = function(req, res) {
    logger.log("\n> ADDINFO request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    logger.time("  ADDINFO request completed");

    if (mongoose.connection.readyState === 1) {
        switch (req.body.type) {
            case "user":
                try {
                    req.body.user = req.body.user.trim().toLowerCase();
                    addUser(req.body.user);
                } catch (err) {
                    logger.error("\n- ERROR ADDINFO field 'user' doesn't exist (" + new Date().toUTCString() + ")");
                    res.sendStatus(400);
                    logger.timeEnd("  ADDINFO request completed");
                }
                break;
            case "language":
                try {
                    req.body.language = req.body.language.trim().toLowerCase();
                    addLanguage(req.body.user, req.body.language);
                } catch (err) {
                    logger.error("\n- ERROR ADDINFO field 'language' doesn't exist (" + new Date().toUTCString() + ")");
                    res.sendStatus(400);
                    logger.timeEnd("  ADDINFO request completed");
                }
                break;
            case "word":
                try {
                    for (var i=0; i<req.body.word.length; i++) {
                        for (var j=0; j<req.body.word[i].fields.length; j++) {
                            req.body.word[i].fields[j] = req.body.word[i].fields[j].trim().toLowerCase();
                        }
                    }
                    addWord(req.body.language, req.body.word);
                } catch (err) {
                    logger.error("\n- ERROR ADDINFO field 'word' doesn't exist (" + new Date().toUTCString() + ")");
                    res.sendStatus(400);
                    logger.timeEnd("  ADDINFO request completed");
                }
                break;
            default:
                logger.error("\n- ERROR ADDINFO unknown type '" + req.body.type + "' (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  ADDINFO request completed");
        }
    } else {
        logger.error("\n- ERROR ADDINFO database disconnected (" + new Date().toUTCString() + ")");
        res.sendStatus(500);
        logger.timeEnd("  ADDINFO request completed");
    }
    

    function addUser(user) {
        logger.log("    Checking user dublicity...");

        User.find({
            name: user
        }, {}, function (err, query) {
            if (err) {
                logger.error("\n- ERROR ADDINFO at checking user '" + user + "' dublicity (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.timeEnd("  ADDINFO request completed");
            } else if (query.length > 0) {
                logger.log("      User '" + user + "' already exists");
                res.status(400).send("User '" + user + "' already exists");
                logger.timeEnd("  ADDINFO request completed");
            } else {
                logger.log("      User '" + user + "' is available");
                logger.log("    Adding user to database...");

                User.create({
                    name: user
                }, function(err, query) {
                    if (err) {
                        logger.error("\n- ERROR ADDINFO at adding user '" + user + "' to database (" + new Date().toUTCString() + "):\n    " + err.message);
                        res.sendStatus(500);
                    } else {
                        logger.log("      User '" + user + "' successfully added");
                        res.status(200).send("User '" + user + "' successfully added");
                    }

                    logger.timeEnd("  ADDINFO request completed");
                });
            }
        });
    }


    function addLanguage(user, language) {
        logger.log("    Checking user existence...");

        User.findById(user, function (err, query) {
            if (err) {
                logger.error("\n- ERROR ADDINFO at checking user '" + user + "' existence (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.timeEnd("  ADDINFO request completed");
            } else if (query === null) {
                logger.error("\n- ERROR ADDINFO user '" + user + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  ADDINFO request completed");
            } else {
                logger.log("      User '" + user + "' existence confirmed");
                logger.log("    Checking language dublicity...");

                var check = false;

                for (var i=0; i<query.languages.length && check==false; i++) {
                    if (query.languages[i].name === language) {
                        check = true;
                        logger.log("      Language '" + language + "' already linked with user '" + user + "'");
                        res.status(400).send("Language '" + language + "' already linked with user");
                        logger.timeEnd("  ADDINFO request completed");
                    }
                }

                if (check == false) {
                    logger.log("      Language '" + language + "' is available");
                    logger.log("    Adding language to database...");

                    Language.create({
                        name: language,
                        user: user
                    }, function(err, query) {
                        if (err) {
                            logger.error("\n- ERROR ADDINFO at adding language '" + language + "' to database (" + new Date().toUTCString() + "):\n    " + err.message);
                            res.sendStatus(500);
                            logger.timeEnd("  ADDINFO request completed");
                        } else {
                            logger.log("      Language '" + language + "' successfully added");
                            logger.log("    Linking user and new language...");
                            
                            User.findByIdAndUpdate(user, {
                                $push: {"languages": query}
                            }, {}, function (err, query) {
                                if (err) {
                                    logger.error("\n- ERROR ADDINFO at linking language '" + language + "' with user '" + query.name + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                                    res.sendStatus(500);
                                } else {
                                    logger.log("      Language '" + language + "' linked with user '" + query.name +"'");
                                    res.status(200).send("Language '" + language + "' added to user '" + query.name +"'");
                                }

                                logger.timeEnd("  ADDINFO request completed");
                            });
                        }
                    });
                }
            }
        });
    }


    function addWord(language, words) {
        logger.log("    Checking language existence...");

        Language.findById(language, function(err, query) {
            if (err) {
                logger.error("\n- ERROR ADDINFO at checking language '" + language + "' existence (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.timeEnd("  ADDINFO request completed");
            } else if (query === null) {
                logger.error("\n- ERROR ADDINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  ADDINFO request completed");
            } else {
                logger.log("      Language '" + language + "' existence confirmed");
                logger.log("    Adding " + words.length + " words to language '" + language + "'");

                var error = false;

                for (var i=0; i<words.length && error==false; i++) {
                    Language.findByIdAndUpdate(language, {
                        $push: {"dictionary": words[i]}
                    }, function(err, query) {
                        if (err) {
                            error = true;
                            logger.error("\n- ERROR ADDINFO at adding words to language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                            res.status(500).send("One or more words couldn't be added");
                        }
                    });
                }
                
                if (!error) {res.status(200).send("Words successfully added");}
                logger.timeEnd("  ADDINFO request completed");
            }
        });
    }
};


exports.delInfo = function(req, res) {
    logger.log("\n> DELETEINFO request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    logger.time("  DELETEINFO request completed");

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
                logger.error("\n- ERROR DELETEINFO unknown type '" + req.body.type + "' (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  DELETEINFO request completed");
        }
    } else {
        logger.error("\n- ERROR DELETEINFO database disconnected (" + new Date().toUTCString() + ")");
        res.sendStatus(500);
        logger.time("  DELETEINFO request completed");
    }


    function delUser(user) {
        logger.log("    Removing user from database...");

        User.findByIdAndRemove(user, function(err, query) {
            if (err) {
                logger.error("\n- ERROR DELETEINFO at removing user '" + user + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.timeEnd("  DELETEINFO request completed");
            } else if (query === null) {
                logger.error("\n- ERROR DELETEINFO user '" + user + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  DELETEINFO request completed");
            } else {
                logger.log("      User '" + user + "' removed");
                logger.log("    Removing " + query.languages.length + " languages from user '" + user + "'");
                
                for (var i=0; i<query.languages.length; i++) {
                    Language.findByIdAndRemove(query.languages[i]._id, function(err, query) {
                        if (err) {
                            logger.error("\n- ERROR DELETEINFO at removing languages of user '" + user + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                        }
                    });
                }

                res.status(200).send("User successfully removed");
                logger.timeEnd("  DELETEINFO request completed");
            }
        });
    }


    function delLanguage(language) {
        logger.log("    Removing language from database...");

        Language.findByIdAndRemove(language, function(err, query) {
            if (err) {
                logger.error("\n- ERROR DELETEINFO at removing language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.timeEnd("  DELETEINFO request completed");
            } else if (query === null) {
                logger.error("\n- ERROR DELETEINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  DELETEINFO request completed");
            } else {
                logger.log("      Language removed");
                logger.log("    Removing user link with language...");

                User.findByIdAndUpdate(query.user, {
                    $pull: {"languages": {"_id": language}}
                }, {},function (err, query) {
                    if (err) {
                        logger.error("\n- ERROR DELETEINFO at removing link with language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                        res.sendStatus(500);
                    } else {
                        logger.log("      User link with language '" + language + "' removed");
                        res.status(200).send("Language successfully removed");
                    }

                    logger.timeEnd("  DELETEINFO request completed");
                });
            }
        });
    }


    function delWord(language, word) {
        logger.log("    Checking language existence...");

        Language.findById(language, function(err, query) {
            if (err) {
                logger.error("\n- ERROR DELETEINFO at checking language '" + language + "' existence (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.timeEnd("  DELETEINFO request completed");
            } else if (query === null) {
                logger.error("\n- ERROR DELETEINFO language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.timeEnd("  DELETEINFO request completed");
            } else {
                logger.log("      Language '" + language + "' existence confirmed");
                logger.log("    Removing word from language...");

                Language.findByIdAndUpdate(language, {
                    $pull: {"dictionary": {"_id": word}}
                }, function(err, query) {
                    if (err) {
                        logger.error("\n- ERROR DELETEINFO at removing word '" + word + "' from language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                        res.sendStatus(500);
                    } else {
                        logger.log("      Word '" + word + "' removed from language '" + language + "'");
                        res.status(200).send("Word successfully removed");
                    }

                    logger.timeEnd("  DELETEINFO request completed");
                });
            }
        });
    }
};


exports.getSession = function(req, res) {
    logger.log("\n> GETSESSION request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
    logger.time("  GETSESSION request completed");

    if (mongoose.connection.readyState === 1) {
        getDictionary(req.query.language);
    } else {
        logger.error("\n- ERROR GETSESSION database disconnected (" + new Date().toUTCString() + ")");
        res.sendStatus(500);
        logger.log("  GETSESSION request completed");
    }

    function getDictionary(language) {
        logger.log("    Getting dictionary...");

        Language.findById(language, {
            _id: 1,
            dictionary: 1
        }, function(err, query) {
            if (err) {
                logger.error("\n- ERROR GETSESSION at getting dictionary from language '" + language + "' (" + new Date().toUTCString() + "):\n    " + err.message);
                res.sendStatus(500);
                logger.log("  GETSESSION request completed");
            } else if (query === null) {
                logger.error("\n- ERROR GETSESSION language '" + language + "' doesn't exist (" + new Date().toUTCString() + ")");
                res.sendStatus(400);
                logger.log("  GETSESSION request completed");
            } else {
                logger.log("      Dictionary obtained from language '" + language + "' (" + query.dictionary.length + " elements)");

                if (query.dictionary.length > 0) {
                    generateSession(query);
                } else {
                    logger.log("      Dictionary is empty, session won't be generated");
                    res.status(400).send("Dictionary is empty");
                    logger.timeEnd("  GETSESSION request completed");
                }
            }
        });
    }

    function generateSession(language) {
        var dictionarySize = language.dictionary.length;
        var sessionSize = Math.ceil(language.dictionary.length/7); // tentative session size, could be bigger than dictionary size (normal session + new/wrong)
        var sessionRef;
        var sequence = new Array();
        var session = new Array();

        logger.log("    Getting session counter reference...");

        for (var i=0; i<dictionarySize; i++) {
            if ((sessionRef === undefined) || (language.dictionary[i].count.total < sessionRef)) {
                sessionRef = language.dictionary[i].count.total;
            }
        }

        logger.log("      Counter reference obtained: " + sessionRef);
        logger.log("    Getting session sequence...");

        for (var i=0; i<dictionarySize; i++) {
            if ((language.dictionary[i].countdown.new != 0) || (language.dictionary[i].countdown.wrong != 0)) {
                sequence[sequence.length] = i;
                sessionSize++;
            }
        }

        logger.log("      Added " + sequence.length + " new/wrong elements to sequence");

        while ((sequence.length < dictionarySize) && (sequence.length < sessionSize)) {
            var n = Math.floor(Math.random() * dictionarySize);
            if ((sequence.indexOf(n) >= 0) || (language.dictionary[n].count.total != sessionRef)) continue;
            sequence[sequence.length] = n;
        }

        logger.log("      Sequence obtained from language '" + language.id + "' (" + sequence.length + " elements)");
        logger.log("    Generating session with calculated sequence...");
        logger.log("      Sequence [" + sequence + "]");

        for (var i=0; i<sequence.length; i++) {
            session[i] = language.dictionary[sequence[i]];
        }

        logger.log("      Session generated (" + session.length + " elements)");

        res.json(session);

        logger.log("  GETSESSION request completed");
    }
};