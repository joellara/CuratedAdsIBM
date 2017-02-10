var express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud');
var os = require('os');
var fs = require('fs');
var path = require('path');
var cfenv = require('cfenv');
var Cloudant = require('cloudant');

var app = express();
var appEnv = cfenv.getAppEnv();

//Initiate Visual Recognition Service
var credentialsVR = appEnv.getServiceCreds('ViCuratedAds');
if (!credentialsVR) {
  credentialsVR = {
    api_key: process.env.visual_recognition_api
  }
}
var visual_recognition = watson.visual_recognition({
  api_key: credentialsVR.api_key,
  version: 'v3',
  version_date: '2016-05-19'
});

var credentialsCloud = appEnv.getServiceCreds('StatisticsCuratedAds');
if(!credentialsCloud){
  credentialsCloud = {
    username: process.env.cloudant_username,
    password: process.env.cloudant_password
  };
}
var cloudant = Cloudant({account:credentialsCloud.username, password:credentialsCloud.password});
var db = cloudant.db.use("statistics_people");

//Redirect to https
app.enable('trust proxy');
app.use(function (req, res, next) {
  if (req.secure || req.headers.host == "localhost:"+appEnv.port) {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

// get the app environment from Cloud Foundry
//API request
app.get('/getdocs',function(req, res){
  db.list({include_docs:true},function(err,body){
    if(err){
      res.status(400).json({
        error:err
      });
    }else{
      res.status(200).json({
        data:JSON.stringify(body.rows,null,2)
      });
    }
  });
});
app.post('/detectface', function (req, res) {
  //Save to temp
  var resource = parseBase64Image(req.body.imgBase64);
  var temp = path.join(os.tmpdir(), 'tempImage.' + resource.type);
  fs.writeFileSync(temp, resource.data);
  var params = {};
  params.images_file = fs.createReadStream(temp);
  visual_recognition.detectFaces(params,
    function (err, response) {
      if (err)
        res.status(400).json({
          error: err
        });
      else{
        var rst = parseResponseToDB(response);
        res.status(200).json(rst);
        db.insert(rst,function(err, body) {
          if (err)
            console.err("Hubo error al insertar en la base de datos");
        });
      }
    }
  );
});

//Send to Angular
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(appEnv.port, appEnv.bind, function () {
  console.log('Listening on port ' + appEnv.url);
});

function parseResponseToDB(response){
  var face = response.images[0].faces[0];
  if(typeof face.age.min == "undefined"){
    face.age = face.age.max;
  }else{
    face.age = Math.floor((face.age.min + face.age.max) / 2);
  }
  face.gender = face.gender.gender;
  delete face.face_location; 
  delete face.identity;
  face.date = new Date().toUTCString();
  return face;      
}

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