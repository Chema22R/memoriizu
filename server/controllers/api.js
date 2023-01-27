"use strict";

/* packages
========================================================================== */

var mongoose = require("mongoose");


/* models
========================================================================== */

var User = require("./../models/user.js");
var Language = require("./../models/language.js");


/* API
========================================================================== */

exports.getInfo = function(req, res) {
    if (mongoose.connection.readyState === 1) {
        switch (req.query.type) {
            case "tree": getTree();break;
            case "users": getUsers();break;
            case "languages": getLanguages(req.query.id);break;
            case "words": getWords(req.query.id);break;
            default:
                writeLog(2, "Unknown type of information to obtain", {origin: req.connection.remoteAddress, type: req.query.type});
                res.sendStatus(400);
        }
    } else {
        writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
        res.sendStatus(500);
    }


    function getTree() {
        User.find({}, {
            _id: 1,
            name: 1,
            languages: 1
        }, function (err, query) {
            if (err) {
                writeLog(1, "Error at getting users and languages list from database", {origin: req.connection.remoteAddress, error: err.message});
				res.sendStatus(500);
			} else {
                writeLog(3, "Users and languages list obtained", {origin: req.connection.remoteAddress, usersCount: query.length});
				res.json(query);
            }
        });
    }

    function getUsers() {
        User.find({}, {
            _id: 1,
            name: 1
        }, function (err, query) {
            if (err) {
                writeLog(1, "Error at getting users list from database", {origin: req.connection.remoteAddress, error: err.message});
				res.sendStatus(500);
			} else {
                writeLog(3, "Users list obtained", {origin: req.connection.remoteAddress, usersCount: query.length});
				res.json(query);
            }
        });
    }

    function getLanguages(user) {
        User.findById(user, { // lgtm [js/sql-injection]
            languages: 1
        }, function (err, query) {
            if (err) {
                writeLog(1, "Error at getting languages list from user", {origin: req.connection.remoteAddress, user: user, error: err.message});
				res.sendStatus(500);
			} else if (query === null) {
                writeLog(2, "Unknown user to obtain languages from", {origin: req.connection.remoteAddress, user: user});
                res.sendStatus(400);
            } else {
                writeLog(3, "Languages list obtained from user", {origin: req.connection.remoteAddress, user: user, langsCount: query.languages.length});
				res.json(query.languages);
            }
        });
    }

    function getWords(language) {
        Language.findById(language, { // lgtm [js/sql-injection]
            _id: 1,
            period: 1,
            "session.date": 1,
            dictionary: 1,
            date: 1
        }, function (err, query) {
            if (err) {
                writeLog(1, "Error at getting words list from language", {origin: req.connection.remoteAddress, language: language, error: err.message});
				res.sendStatus(500);
			} else if (query === null) {
                writeLog(2, "Unknown language to obtain words from", {origin: req.connection.remoteAddress, language: language});
                res.sendStatus(400);
            } else {
                writeLog(3, "Words list obtained from language", {origin: req.connection.remoteAddress, language: language, wordsCount: query.dictionary.length});
                if (!query.session.date) {query.session.date = null;}
				res.json(query);
            }
        });
    }

    function writeLog(type, msg, meta) {
        msg = "Get Info: " + msg;

        switch (type) {
            case 1:
                req.app.locals.logger.error(msg, { meta: meta });
                break;
            case 2:
                req.app.locals.logger.warn(msg, { meta: meta });
                break;
            case 3:
                req.app.locals.logger.info(msg, { meta: meta });
                break;
            default:
                req.app.locals.logger.debug(msg, { meta: meta });
        }
    }
};


exports.addInfo = function(req, res) {
    if (mongoose.connection.readyState === 1) {
        switch (req.body.type) {
            case "user":
                try {
                    req.body.user = req.body.user.trim().toLowerCase().replace(/\s\s+/g, " ");
                    addUser(req.body.user);
                } catch (err) {
                    writeLog(2, "Field 'user' does not exist", {origin: req.connection.remoteAddress});
                    res.sendStatus(400);
                }
                break;
            case "language":
                try {
                    req.body.language = req.body.language.trim().toLowerCase().replace(/\s\s+/g, " ");
                    addLanguage(req.body.user, req.body.language, req.body.period);
                } catch (err) {
                    writeLog(2, "Field 'language' does not exist", {origin: req.connection.remoteAddress});
                    res.sendStatus(400);
                }
                break;
            case "word":
                try {
                    for (var i=0; i<req.body.word.length; i++) {
                        for (var j=0; j<req.body.word[i].fields.length; j++) {
                            req.body.word[i].fields[j] = req.body.word[i].fields[j].trim().toLowerCase().replace(/\s\s+/g, " ");
                        }
                    }
                    addWord(req.body.language, req.body.word);
                } catch (err) {
                    writeLog(2, "Field 'word' does not exist", {origin: req.connection.remoteAddress});
                    res.sendStatus(400);
                }
                break;
            default:
                writeLog(2, "Unkonown type of information to add", {origin: req.connection.remoteAddress, type: req.body.type});
                res.sendStatus(400);
        }
    } else {
        writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
        res.sendStatus(500);
    }
    

    function addUser(user) {
        User.find({ // lgtm [js/sql-injection]
            name: user
        }, {}, function (err, query) {
            if (err) {
                writeLog(1, "Error at checking user duplicity", {origin: req.connection.remoteAddress, user: user, error: err.message});
                res.sendStatus(500);
            } else if (query.length > 0) {
                writeLog(2, "User specified already exists", {origin: req.connection.remoteAddress, user: user});
                res.status(400).send("User '" + user + "' already exists");
            } else {
                User.create({
                    name: user
                }, function(err, query) {
                    if (err) {
                        writeLog(1, "Error at adding user to database", {origin: req.connection.remoteAddress, user: user, error: err.message});
                        res.sendStatus(500);
                    } else {
                        writeLog(3, "User added to database", {origin: req.connection.remoteAddress, user: user});
                        res.status(200).send("User '" + user + "' successfully added");
                    }
                });
            }
        });
    }

    function addLanguage(user, language, period) {
        User.findById(user, function (err, query) { // lgtm [js/sql-injection]
            if (err) {
                writeLog(1, "Error at checking user existence", {origin: req.connection.remoteAddress, user: user, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "User to add language into does not exist", {origin: req.connection.remoteAddress, user: user});
                res.sendStatus(400);
            } else {
                var check = false;

                for (var i=0; i<query.languages.length && check==false; i++) {
                    if (query.languages[i].name === language) {
                        check = true;
                        writeLog(2, "Language already added to user", {origin: req.connection.remoteAddress, user: user, language: language});
                        res.status(400).send("Language '" + language + "' already linked with user");
                    }
                }

                if (check == false) {
                    Language.create({
                        name: language,
                        user: user,
                        "period.length": --period
                    }, function(err, query) {
                        if (err) {
                            writeLog(1, "Error at adding language to database", {origin: req.connection.remoteAddress, language: language, error: err.message});
                            res.sendStatus(500);
                        } else {
                            User.findByIdAndUpdate(user, { // lgtm [js/sql-injection]
                                $push: {"languages": query}
                            }, {}, function (err, query) {
                                if (err) {
                                    writeLog(1, "Error at linking language with user", {origin: req.connection.remoteAddress, language: language, user: query.name, error: err.message});
                                    res.sendStatus(500);
                                } else {
                                    writeLog(3, "Language added to user", {origin: req.connection.remoteAddress, language: language, user: query.name});
                                    res.status(200).send("Language '" + language + "' added to user '" + query.name +"'");
                                }
                            });
                        }
                    });
                }
            }
        });
    }

    function addWord(language, words) {
        Language.findById(language, function(err, query) { // lgtm [js/sql-injection]
            if (err) {
                writeLog(1, "Error at checking language existence", {origin: req.connection.remoteAddress, language: language, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "Language to add word into does not exist", {origin: req.connection.remoteAddress, language: language});
                res.sendStatus(400);
            } else {
                var error = false;

                for (var i=0; i<words.length && error==false; i++) {
                    Language.findByIdAndUpdate(language, { // lgtm [js/sql-injection]
                        $push: {"dictionary": words[i]}
                    }, function(err, query) {
                        if (err) {
                            error = true;
                            writeLog(1, "Error at adding words to language", {origin: req.connection.remoteAddress, language: language, error: err.message});
                            res.status(500).send("One or more words couldn't be added");
                        }
                    });
                }
                
                if (!error) {
                    writeLog(3, "Words added to language", {origin: req.connection.remoteAddress, wordsCount: words.length, language: language});
                    res.status(200).send("Words successfully added");
                }
            }
        });
    }

    function writeLog(type, msg, meta) {
        msg = "Add Info: " + msg;

        switch (type) {
            case 1:
                req.app.locals.logger.error(msg, { meta: meta });
                break;
            case 2:
                req.app.locals.logger.warn(msg, { meta: meta });
                break;
            case 3:
                req.app.locals.logger.info(msg, { meta: meta });
                break;
            default:
                req.app.locals.logger.debug(msg, { meta: meta });
        }
    }
};


exports.delInfo = function(req, res) {
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
                writeLog(2, "Unkonown type of information to remove", {origin: req.connection.remoteAddress, type: req.body.type});
                res.sendStatus(400);
        }
    } else {
        writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
        res.sendStatus(500);
    }


    function delUser(user) {
        User.findByIdAndRemove(user, function(err, query) { // lgtm [js/sql-injection]
            if (err) {
                writeLog(1, "Error at removing user from database", {origin: req.connection.remoteAddress, user: user, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "User does not exist", {origin: req.connection.remoteAddress, user: user});
                res.sendStatus(400);
            } else {
                for (var i=0; i<query.languages.length; i++) {
                    Language.findByIdAndRemove(query.languages[i]._id, function(err, query2) {
                        if (err) {
                            writeLog(1, "Error at removing language from user", {origin: req.connection.remoteAddress, user: user, language: query.languages[i]._id, error: err.message});
                        }
                    });
                }

                writeLog(3, "User removed from database", {origin: req.connection.remoteAddress, user: user});
                res.status(200).send("User successfully removed");
            }
        });
    }

    function delLanguage(language) {
        Language.findByIdAndRemove(language, function(err, query) { // lgtm [js/sql-injection]
            if (err) {
                writeLog(1, "Error at removing language from database", {origin: req.connection.remoteAddress, language: language, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "Language does not exist", {origin: req.connection.remoteAddress, language: language});
                res.sendStatus(400);
            } else {
                User.findByIdAndUpdate(query.user, {
                    $pull: {"languages": {"_id": language}}
                }, {}, function (err, query2) {
                    if (err) {
                        writeLog(1, "Error at removing language link with user", {origin: req.connection.remoteAddress, language: language, user: query.user, error: err.message});
                        res.sendStatus(500);
                    } else {
                        writeLog(3, "Language removed from user", {origin: req.connection.remoteAddress, language: language, user: query.user});
                        res.status(200).send("Language successfully removed");
                    }
                });
            }
        });
    }

    function delWord(language, word) {
        Language.findById(language, function(err, query) { // lgtm [js/sql-injection]
            if (err) {
                writeLog(1, "Error at checking language existence", {origin: req.connection.remoteAddress, language: language, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "Language does not exist", {origin: req.connection.remoteAddress, language: language});
                res.sendStatus(400);
            } else {
                Language.findByIdAndUpdate(language, { // lgtm [js/sql-injection]
                    $pull: {"dictionary": {"_id": word}}
                }, function(err, query) {
                    if (err) {
                        writeLog(1, "Error at removing word from language", {origin: req.connection.remoteAddress, word: word, language: language, error: err.message});
                        res.sendStatus(500);
                    } else {
                        writeLog(3, "Word removed from language", {origin: req.connection.remoteAddress, word: word, language: language});
                        res.status(200).send("Word successfully removed");
                    }
                });
            }
        });
    }

    function writeLog(type, msg, meta) {
        msg = "Delete Info: " + msg;

        switch (type) {
            case 1:
                req.app.locals.logger.error(msg, { meta: meta });
                break;
            case 2:
                req.app.locals.logger.warn(msg, { meta: meta });
                break;
            case 3:
                req.app.locals.logger.info(msg, { meta: meta });
                break;
            default:
                req.app.locals.logger.debug(msg, { meta: meta });
        }
    }
};


exports.getSession = function(req, res) {
    if (mongoose.connection.readyState === 1) {
        getDictionary(req.query.language);
    } else {
        writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
        res.sendStatus(500);
    }


    function getDictionary(language) {
        Language.findById(language, { // lgtm [js/sql-injection]
            _id: 1,
            period: 1,
            session: 1,
            dictionary: 1
        }, function(err, query) {
            if (err) {
                writeLog(1, "Error at getting words list from language", {origin: req.connection.remoteAddress, language: language, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "Language does not exist", {origin: req.connection.remoteAddress, language: language});
                res.sendStatus(400);
            } else {
                writeLog(4, "Words list obtained", {origin: req.connection.remoteAddress, language: language, wordCount: query.dictionary.length});

                if (query.dictionary.length > 0) {
                    var current = new Date();
                    
                    if ((query.session.date == undefined) ||
                        (current.getFullYear() > query.session.date.getFullYear()) ||
                        (current.getMonth() > query.session.date.getMonth()) ||
                        (current.getDate() > query.session.date.getDate())) {
                            generateSession(query);
                    } else {
                        continueSession(query);
                    }
                } else {
                    writeLog(2, "Words list is empty", {origin: req.connection.remoteAddress, language: language});
                    res.status(400).send("Dictionary is empty");
                }
            }
        });
    }

    function generateSession(language) {
        var dictionarySize = language.dictionary.length;
        var pendingWords = 0;
        var sessionSize;
        var sequenceSpecial = new Array();
        var sequenceNormal = new Array();
        var sequence = new Array(); // lgtm [js/useless-assignment-to-local]
        var session = new Array();

        if (language.period.current == 0) {
            resetWords(language._id, dictionarySize);
        }

        for (var j, x, i=dictionarySize; i; i--) {
            j = Math.floor(Math.random() * i);
            x = language.dictionary[i-1];
            language.dictionary[i-1] = language.dictionary[j];
            language.dictionary[j] = x;
        }

        for (var i=0; i<dictionarySize; i++) {
            if ((!language.dictionary[i].ref || language.period.current == 0) && (language.dictionary[i].countdown.new == 0) && (language.dictionary[i].countdown.wrong == 0)) {
                pendingWords++;
            }
        }

        sessionSize = Math.ceil(pendingWords/(language.period.length-language.period.current+1));

        writeLog(4, "Session length calculated", {origin: req.connection.remoteAddress, language: language._id, sessionSize: sessionSize});

        for (var i=0; i<dictionarySize; i++) {
            if ((language.dictionary[i].countdown.new > 0) || (language.dictionary[i].countdown.wrong > 0)) {
                sequenceSpecial[sequenceSpecial.length] = i;
            }
        }

        writeLog(4, "Special session sequence obtained", {origin: req.connection.remoteAddress, language: language._id, sequenceSpecialSize: sequenceSpecial.length});

        for (var i=0; i<dictionarySize && sequenceNormal.length<sessionSize; i++) {
            if ((sequenceNormal.indexOf(i) == -1) && (sequenceSpecial.indexOf(i) == -1) && (!language.dictionary[i].ref || language.period.current == 0)) {
                sequenceNormal[sequenceNormal.length] = i;
            }
        }

        writeLog(4, "Normal session sequence obtained", {origin: req.connection.remoteAddress, language: language._id, sequenceNormalSize: sequenceNormal.length});

        sequence = sequenceSpecial.concat(sequenceNormal);

        for (var j, x, i=sequence.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = sequence[i-1];
            sequence[i-1] = sequence[j];
            sequence[j] = x;
        }

        writeLog(4, "Session sequences combined and shuffled", {origin: req.connection.remoteAddress, language: language._id, sequenceSize: sequence.length});

        for (var i=0; i<sequence.length; i++) {
            session[i] = language.dictionary[sequence[i]];
        }

        writeLog(4, "Session generated", {origin: req.connection.remoteAddress, language: language._id, sessionSize: session.length});

        if (language.period.current == language.period.length) {
            language.period.current = 0;
        } else {
            language.period.current++;
        }

        Language.update({
            _id: language._id,
        }, {
            "period.current": language.period.current,
            "session.last": session,
            "session.date": new Date()
        }, function(err, query) {
            if (err) {
                writeLog(1, "Error at updating period state of language", {origin: req.connection.remoteAddress, language: language._id, error: err.message});
                res.sendStatus(500);
            } else {
                writeLog(3, "Period state of language updated", {origin: req.connection.remoteAddress, language: language._id, nextSession: language.period.current, period: language.period.length});
                res.json(session);
            }
        });
    }

    function continueSession(language) {
        var lastSession = language.session.last;
        var newSession = new Array();

        for (var i=0; i<lastSession.length; i++) {
            for (var j=0; j<language.dictionary.length; j++) {
                if ((lastSession[i]._id.equals(language.dictionary[j]._id)) &&
                    (lastSession[i].count.correct == language.dictionary[j].count.correct) &&
                    (lastSession[i].count.wrong == language.dictionary[j].count.wrong)) {
                        newSession[newSession.length] = language.dictionary[j];
                        break;
                }
            }
        }

        if (newSession.length > 0) {
            writeLog(3, "Today's session recovered and incompleted yet", {origin: req.connection.remoteAddress, language: language._id, newSessionSize: newSession.length, originalSessionSize: lastSession.length});

            for (var j, x, i=newSession.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = newSession[i-1];
                newSession[i-1] = newSession[j];
                newSession[j] = x;
            }

            writeLog(4, "Today's recovered session shuffled", {origin: req.connection.remoteAddress, language: language._id, newSessionSize: newSession.length});

            res.json(newSession);
        } else {
            writeLog(2, "Today's session already completed", {origin: req.connection.remoteAddress, language: language._id});
            res.status(400).send("Today's session already completed");
        }
    }

    function resetWords(language, dictionarySize) {
        for (var i=0; i<dictionarySize; i++) {
            Language.update({
                _id: language,
                "dictionary.ref": true
            }, {
                "dictionary.$.ref": false
            }, function(err, query) {
                if (err) {
                    writeLog(1, "Error at reseting words references on language", {origin: req.connection.remoteAddress, language: language, error: err.message});
                }
            });
        }

        writeLog(4, "Words references reseted on language", {origin: req.connection.remoteAddress, language: language});
    }

    function writeLog(type, msg, meta) {
        msg = "Get Session: " + msg;

        switch (type) {
            case 1:
                req.app.locals.logger.error(msg, { meta: meta });
                break;
            case 2:
                req.app.locals.logger.warn(msg, { meta: meta });
                break;
            case 3:
                req.app.locals.logger.info(msg, { meta: meta });
                break;
            default:
                req.app.locals.logger.debug(msg, { meta: meta });
        }
    }
};


exports.postResults = function(req, res) {
    if (mongoose.connection.readyState === 1) {
        getWord(req.query.language, req.query.word, req.query.state);
    } else {
        writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
        res.sendStatus(500);
    }


    function getWord(language, word, state) {
        Language.findOne({ // lgtm [js/sql-injection]
            _id: language,
            "dictionary._id": word
        }, {
            "dictionary.$": 1
        }, function(err, query) {
            if (err) {
                writeLog(1, "Error at checking language and word existence", {origin: req.connection.remoteAddress, language: language, word: word, error: err.message});
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(2, "Language and/or word does not exist", {origin: req.connection.remoteAddress, language: language, word: word});
                res.sendStatus(400);
            } else {
                writeLog(4, "Word existence confirmed into language", {origin: req.connection.remoteAddress, language: language, word: word});
                postResult(query, state);
            }
        });
    }

    function postResult(data, state) {
        var word = data.dictionary[0];

        if ((state == "true") || (state == true)) {
            word.ref = true;
            word.count.correct++;

            if (word.countdown.new > 0) {word.countdown.new--;}
            if (word.countdown.wrong > 0) {word.countdown.wrong--;}
        } else if ((state == "false") || (state == false)) {
            word.ref = true;
            word.count.wrong++;

            word.countdown.wrong = 2;
        }

        writeLog(4, "Changes generated for word", {origin: req.connection.remoteAddress, word: word._id, state: state});

        Language.update({
            _id: data._id,
            "dictionary._id": word._id
        }, {
            "dictionary.$.ref": word.ref,
            "dictionary.$.count.correct": word.count.correct,
            "dictionary.$.count.wrong": word.count.wrong,
            "dictionary.$.countdown.new": word.countdown.new,
            "dictionary.$.countdown.wrong": word.countdown.wrong
        }, function(err, query) {
            if (err) {
                writeLog(1, "Error at applying changes into database for word", {origin: req.connection.remoteAddress, word: word._id, error: err.message});
                res.sendStatus(500);
            } else {
                writeLog(3, "Changes applied to word", {origin: req.connection.remoteAddress, word: word._id});
                res.sendStatus(200);
            }
        });
    }

    function writeLog(type, msg, meta) {
        msg = "Post Results: " + msg;

        switch (type) {
            case 1:
                req.app.locals.logger.error(msg, { meta: meta });
                break;
            case 2:
                req.app.locals.logger.warn(msg, { meta: meta });
                break;
            case 3:
                req.app.locals.logger.info(msg, { meta: meta });
                break;
            default:
                req.app.locals.logger.debug(msg, { meta: meta });
        }
    }
};


exports.checkStatus = function(req, res) {
	checkDatabase(0);

	function checkDatabase(attempt) {
		if (mongoose.connection.readyState === 1) {
			User.find({}, {
				_id: 0,
				date: 1
			}, function(err, query) {
				if (err) {
					if (attempt < 2) {
						setTimeout(() => {
							checkDatabase(++attempt);
						}, 5000);
					} else {
						writeLog(1, "Error accessing Users collection", {origin: req.connection.remoteAddress, error: err.message});
						res.sendStatus(500);
					}
				} else {
					writeLog(3, "Database connected and Users collection accessible", {origin: req.connection.remoteAddress});
					res.sendStatus(200);
				}
			});
		} else {
			if (attempt < 2) {
			    setTimeout(() => {
					checkDatabase(++attempt);
			    }, 5000);
			} else {
				writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
				res.sendStatus(500);
			}
		}
	}

	function writeLog(type, msg, meta) {
		switch (type) {
			case 1:
				req.app.locals.logger.error(msg, {app: 'Status Check', meta: meta});
				break;
			case 2:
				req.app.locals.logger.warn(msg, {app: 'Status Check', meta: meta});
				break;
			case 3:
				req.app.locals.logger.info(msg, {app: 'Status Check', meta: meta});
				break;
			default:
				req.app.locals.logger.debug(msg, {app: 'Status Check', meta: meta});
		}
    }
};