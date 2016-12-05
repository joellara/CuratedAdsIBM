
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var multer = require('multer');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var app = express();
var visual_recognition = watson.visual_recognition({
	api_key: '{api_key}',
	version: 'v3',
	version_date: '2016-05-19'
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.urlencoded({'extended':'true'}));            
app.use(bodyParser.json());                         
/*            
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({
  storage: storage
});
app.upload = upload;
*/
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
//Send to Angular
app.get('*', function(req, res) {
	res.sendFile(__dirname+'/public/index.html');
});


//Start server
app.listen(appEnv.port, appEnv.bind, function() {
	console.log("server starting on " + appEnv.url);
});
