
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var uuid = require('uuid');
var os = require('os');
var fs = require('fs');
var path = require('path');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var app = express();
var credentialsVR = appEnv.getServiceCreds('ViCuratedAds');
var visual_recognition = watson.visual_recognition({
	api_key: credentialsVR['api_key'],
	version: 'v3',
	version_date: '2016-05-19'
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));                                 

// get the app environment from Cloud Foundry
//API request
function parseBase64Image(imageBase64) {
  var matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  var resource = {};

  if (matches.length !== 3) {
    return null;
  }

  resource.type = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  resource.data = new Buffer(matches[2], 'base64');
  return resource;
}

app.post('/detectface',function(req,res){

  //Save to temp
  var resource = parseBase64Image(req.body.imgBase64);
  var temp = path.join(os.tmpdir(), 'tempImage.' + resource.type);
  fs.writeFileSync(temp, resource.data);
  var params= {};
  params.images_file = fs.createReadStream(temp);
  visual_recognition.detectFaces(params,
    function(err, response) {
      if (err)
        res.status(400).json({error:err});
      else
        res.status(200).json({data:JSON.stringify(response, null, 2)});
    }
  );
});
//Send to Angular
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname,'/public/index.html'));
});

//Start server
app.listen(appEnv.port, appEnv.bind, function() {
	console.log("server starting on " + appEnv.url);
});