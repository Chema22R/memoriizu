"use strict";

/* packages
========================================================================== */

var mongoose = require("mongoose");
var fs = require("fs");


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
                writeLog(20, req.query.type);
                res.sendStatus(400);
        }
    } else {
        writeLog(10, null);
        res.sendStatus(500);
    }


    function getTree() {
        User.find({}, {
            _id: 1,
            name: 1,
            languages: 1
        }, function (err, query) {
            if (err) {
                writeLog(11, err.message);
				res.sendStatus(500);
			} else {
                writeLog(30, query.length);
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
                writeLog(12, err.message);
				res.sendStatus(500);
			} else {
                writeLog(31, query.length);
				res.json(query);
            }
        });
    }

    function getLanguages(user) {
        User.findById(user, {
            languages: 1
        }, function (err, query) {
            if (err) {
                writeLog(13, [user, err.message]);
				res.sendStatus(500);
			} else if (query === null) {
                writeLog(21, user);
                res.sendStatus(400);
            } else {
                writeLog(32, [user, query.languages.length]);
				res.json(query.languages);
            }
        });
    }

    function getWords(language) {
        Language.findById(language, {
            _id: 1,
            period: 1,
            "session.date": 1,
            dictionary: 1,
            date: 1
        }, function (err, query) {
            if (err) {
                writeLog(14, [language, err.message]);
				res.sendStatus(500);
			} else if (query === null) {
                writeLog(22, language);
                res.sendStatus(400);
            } else {
                writeLog(33, [language, query.dictionary.length]);
                if (!query.session.date) {query.session.date = null;}
				res.json(query);
            }
        });
    }

    function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'GETINFO',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
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
                    writeLog(20, null);
                    res.sendStatus(400);
                }
                break;
            case "language":
                try {
                    req.body.language = req.body.language.trim().toLowerCase().replace(/\s\s+/g, " ");
                    addLanguage(req.body.user, req.body.language, req.body.period);
                } catch (err) {
                    writeLog(21, null);
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
                    writeLog(22, null);
                    res.sendStatus(400);
                }
                break;
            default:
                writeLog(23, req.body.type);
                res.sendStatus(400);
        }
    } else {
        writeLog(10, null);
        res.sendStatus(500);
    }
    

    function addUser(user) {
        User.find({
            name: user
        }, {}, function (err, query) {
            if (err) {
                writeLog(11, [user, err.message]);
                res.sendStatus(500);
            } else if (query.length > 0) {
                writeLog(24, user);
                res.status(400).send("User '" + user + "' already exists");
            } else {
                User.create({
                    name: user
                }, function(err, query) {
                    if (err) {
                        writeLog(12, [user, err.message]);
                        res.sendStatus(500);
                    } else {
                        writeLog(30, user);
                        res.status(200).send("User '" + user + "' successfully added");
                    }
                });
            }
        });
    }

    function addLanguage(user, language, period) {
        User.findById(user, function (err, query) {
            if (err) {
                writeLog(13, [user, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(25, user);
                res.sendStatus(400);
            } else {
                var check = false;

                for (var i=0; i<query.languages.length && check==false; i++) {
                    if (query.languages[i].name === language) {
                        check = true;
                        writeLog(26, [user, language]);
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
                            writeLog(14, [language, err.message]);
                            res.sendStatus(500);
                        } else {
                            User.findByIdAndUpdate(user, {
                                $push: {"languages": query}
                            }, {}, function (err, query) {
                                if (err) {
                                    writeLog(15, [language, query.name, err.message]);
                                    res.sendStatus(500);
                                } else {
                                    writeLog(31, [language, query.name]);
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
        Language.findById(language, function(err, query) {
            if (err) {
                writeLog(16, [language, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(27, language);
                res.sendStatus(400);
            } else {
                var error = false;

                for (var i=0; i<words.length && error==false; i++) {
                    Language.findByIdAndUpdate(language, {
                        $push: {"dictionary": words[i]}
                    }, function(err, query) {
                        if (err) {
                            error = true;
                            writeLog(17, [language, err.message]);
                            res.status(500).send("One or more words couldn't be added");
                        }
                    });
                }
                
                if (!error) {
                    writeLog(32, [words.length, language]);
                    res.status(200).send("Words successfully added");
                }
            }
        });
    }

    function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'ADDINFO',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
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
                writeLog(20, req.body.type);
                res.sendStatus(400);
        }
    } else {
        writeLog(10, null);
        res.sendStatus(500);
    }


    function delUser(user) {
        User.findByIdAndRemove(user, function(err, query) {
            if (err) {
                writeLog(11, [user, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(21, user);
                res.sendStatus(400);
            } else {
                for (var i=0; i<query.languages.length; i++) {
                    Language.findByIdAndRemove(query.languages[i]._id, function(err, query2) {
                        if (err) {
                            writeLog(12, [user, query.languages[i]._id, err.message]);
                        }
                    });
                }

                writeLog(30, user);
                res.status(200).send("User successfully removed");
            }
        });
    }

    function delLanguage(language) {
        Language.findByIdAndRemove(language, function(err, query) {
            if (err) {
                writeLog(13, [language, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(22, language);
                res.sendStatus(400);
            } else {
                User.findByIdAndUpdate(query.user, {
                    $pull: {"languages": {"_id": language}}
                }, {}, function (err, query2) {
                    if (err) {
                        writeLog(14, [language, query.user, err.message]);
                        res.sendStatus(500);
                    } else {
                        writeLog(31, [language, query.user]);
                        res.status(200).send("Language successfully removed");
                    }
                });
            }
        });
    }

    function delWord(language, word) {
        Language.findById(language, function(err, query) {
            if (err) {
                writeLog(15, [language, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(23, language);
                res.sendStatus(400);
            } else {
                Language.findByIdAndUpdate(language, {
                    $pull: {"dictionary": {"_id": word}}
                }, function(err, query) {
                    if (err) {
                        writeLog(16, [word, language, err.message]);
                        res.sendStatus(500);
                    } else {
                        writeLog(32, [word, language]);
                        res.status(200).send("Word successfully removed");
                    }
                });
            }
        });
    }

    function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'DELETEINFO',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
        }
    }
};


exports.getSession = function(req, res) {
    if (mongoose.connection.readyState === 1) {
        getDictionary(req.query.language);
    } else {
        writeLog(10, null);
        res.sendStatus(500);
    }


    function getDictionary(language) {
        Language.findById(language, {
            _id: 1,
            period: 1,
            session: 1,
            dictionary: 1
        }, function(err, query) {
            if (err) {
                writeLog(11, [language, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(20, language);
                res.sendStatus(400);
            } else {
                writeLog(40, [language, query.dictionary.length]);

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
                    writeLog(21, language);
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
        var sequence = new Array();
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

        writeLog(41, sessionSize);

        for (var i=0; i<dictionarySize; i++) {
            if ((language.dictionary[i].countdown.new > 0) || (language.dictionary[i].countdown.wrong > 0)) {
                sequenceSpecial[sequenceSpecial.length] = i;
            }
        }

        writeLog(42, [sequenceSpecial.length, sequenceSpecial]);

        for (var i=0; i<dictionarySize && sequenceNormal.length<sessionSize; i++) {
            if ((sequenceNormal.indexOf(i) == -1) && (sequenceSpecial.indexOf(i) == -1) && (!language.dictionary[i].ref || language.period.current == 0)) {
                sequenceNormal[sequenceNormal.length] = i;
            }
        }

        writeLog(43, [sequenceNormal.length, sequenceNormal]);

        sequence = sequenceSpecial.concat(sequenceNormal);

        for (var j, x, i=sequence.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = sequence[i-1];
            sequence[i-1] = sequence[j];
            sequence[j] = x;
        }

        writeLog(44, [sequence.length, sequence]);

        for (var i=0; i<sequence.length; i++) {
            session[i] = language.dictionary[sequence[i]];
        }

        writeLog(45, session.length);

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
                writeLog(12, [language._id, err.message]);
                res.sendStatus(500);
            } else {
                writeLog(30, [language._id, language.period.current, language.period.length]);
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
            writeLog(31, [language._id, newSession.length, lastSession.length]);
            res.json(newSession);
        } else {
            writeLog(22, language._id);
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
                    writeLog(13, [language, err.message]);
                }
            });
        }

        writeLog(46, language);
    }

    function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'GETSESSION',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
        }
    }
};


exports.postResults = function(req, res) {
    if (mongoose.connection.readyState === 1) {
        getWord(req.query.language, req.query.word, req.query.state);
    } else {
        writeLog(10, null);
        res.sendStatus(500);
    }


    function getWord(language, word, state) {
        Language.findOne({
            _id: language,
            "dictionary._id": word
        }, {
            "dictionary.$": 1
        }, function(err, query) {
            if (err) {
                writeLog(11, [language, word, err.message]);
                res.sendStatus(500);
            } else if (query === null) {
                writeLog(20, [language, word]);
                res.sendStatus(400);
            } else {
                writeLog(40, [language, word]);
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

        writeLog(41, [word._id, state]);

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
                writeLog(12, [word._id, err.message]);
                res.sendStatus(500);
            } else {
                writeLog(32, word._id);
                res.sendStatus(200);
            }
        });
    }

    function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'POSTRESULTS',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
        }
    }
};