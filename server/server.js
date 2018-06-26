"use strict";

/* packages
========================================================================== */

var express = require("express");
var app = express();

var cors = require("cors");
var bodyParser = require("body-parser");
var fs = require("fs");
var mongoose = require("mongoose");


/* controllers
========================================================================== */

var api = require("./controllers/api.js");


/* app configuration
========================================================================== */

app.use(cors());
app.use(bodyParser.json());


/* log
========================================================================== */

app.locals.logPath = './log.json';

if (fs.existsSync(app.locals.logPath)) {
	app.locals.logger = JSON.parse(fs.readFileSync(app.locals.logPath, {encoding: 'utf8', flag: 'r'}));

	for (var i=0; i<app.locals.logger.history.length;) {
		if (new Date().getTime() - new Date(app.locals.logger.history[i].date).getTime() > 31556952000) {	// 31556952000ms = 1 year
			app.locals.logger.history.splice(i, 1);
		} else {
			i++;
		}
	}
} else {
	app.locals.logger = {
		level: 40,
		history: []
	};
	fs.writeFileSync(app.locals.logPath, JSON.stringify(app.locals.logger), {encoding: 'utf8', flag: 'w'});
}


/* connections
========================================================================== */

var serverPort = 8082;
var uri = "mongodb://localhost/memoriizu";
var promise;

app.listen(serverPort, function () {
	console.log("> Memoriizu server running on http://localhost:" + serverPort);
});

promise = mongoose.connect(uri, {useMongoClient: true}, function(err) {
	if (err) {
		console.error("- ERROR connecting to database memoriizu\n     " + err.message);
	} else {
		console.log("> Connected to database memoriizu");
	}
});


/* API
========================================================================== */

app.get('/info', api.getInfo);
app.post('/info', api.addInfo);
app.delete('/info', api.delInfo);

app.get('/session', api.getSession);
app.post('/session', api.postResults);