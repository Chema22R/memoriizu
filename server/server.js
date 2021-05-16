"use strict";

/* packages
========================================================================== */

var express = require("express");
var app = express();

var cors = require("cors");
var bodyParser = require("body-parser");
var Logger = require('logdna');
var Sentry = require('@sentry/node');
var mongoose = require("mongoose");


/* sentry
========================================================================== */

Sentry.init(process.env.MEMORIIZU_SENTRY);
app.use(Sentry.Handlers.requestHandler());


/* controllers
========================================================================== */

var api = require("./controllers/api.js");


/* app configuration
========================================================================== */

app.use(cors());
app.use(bodyParser.json());


/* log
========================================================================== */

app.locals.logger = Logger.createLogger(
	process.env.MEMORIIZU_LOGDNA_KEY,
	process.env.MEMORIIZU_LOGDNA_CONFIG
);


/* database connection
========================================================================== */

mongoose.connect(process.env.MEMORIIZU_DATABASE_URI, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useUnifiedTopology: true
}, function(err) {
	if (err) {
		app.locals.logger.error("Initialization: Error connecting to database 'memoriizu'", {meta: {error: err.message}});
		console.error("- ERROR connecting to database 'memoriizu'\n     " + err.message);
	} else {
		console.log("> Connected to database 'memoriizu'");
	}
});


/* API
========================================================================== */

app.get('/info', api.getInfo);
app.post('/info', api.addInfo);
app.delete('/info', api.delInfo);

app.get('/session', api.getSession);
app.post('/session', api.postResults);

app.get('/checkStatus', api.checkStatus);


/* app connection
========================================================================== */

app.use(Sentry.Handlers.errorHandler());
app.use((err, req, res, next) => { res.sendStatus(500); });

app.listen(process.env.PORT || 8000, function () {
	console.log("> Memoriizu server running on http://localhost:" + (process.env.PORT || 8000));
});
