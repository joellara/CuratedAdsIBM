
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var multer = require('multer');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var app = express();
var visual_recognition = watson.visual_recognition({
	api_key: '81c4ef028bae3feb49ee20b85cc339e39aeb56c5',
	version: 'v3',
	version_date: '2016-05-19'
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));                                 
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
//API request
app.post('/detectface',function(req,res){
  var img = req.body.imgBase64;
    params = {
      images_file: {img}
    };
    visual_recognition.detectFaces(params,
    function(err, response) {
      if (err)
        console.log(err);
      else
        console.log(JSON.stringify(response, null, 2));
    });
});
//Send to Angular
app.get('*', function(req, res) {
	res.sendFile(__dirname+'/public/index.html');
});


//Start server
app.listen(appEnv.port, appEnv.bind, function() {
	console.log("server starting on " + appEnv.url);
});
