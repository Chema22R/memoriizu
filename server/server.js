/* packages
========================================================================== */

var express = require("express");
var bodyParser = require("body-parser")
var router = express.Router();
var app = express();

var cors = require("cors");
var mongoose = require("mongoose");


/* controllers
========================================================================== */

var api = require("./controllers/api.js");


/* app configuration
========================================================================== */

app.use(cors());
app.use(bodyParser.json())
app.use("/api", router);


/* connections
========================================================================== */

var serverPort = 8081;
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

router.route("/info")
	.post(api.addInfo)
	.delete(api.delInfo)
	.get(api.getInfo);

/*router.route("/file/:id")
	.get(api.getById)
	.delete(api.deleteById);*/