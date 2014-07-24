/* Sample code to perform trivial operation on Blitline */
/* Requires an APPLICATION_ID which you can get from blitline.com for free and without obligation, or e
 ven an email. */

var fs = require('node-fs'),
  Blitline = require('./lib/blitline'),
  blitline = new Blitline(),
  express = require('express'),
  mime = require("mime"),
  crypto = require("crypto"),
  connect = require('connect'),
  app = express();

var configFile;
if(process.env.NODE_ENV === 'production')
  configFile = '/config.json.production';
else
  configFile = '/config.json';

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = JSON.parse(fs.readFileSync(__dirname + configFile, 'utf-8'));
  for (var i in config) {
    config[i] = process.env[i.toUpperCase()] || config[i];
  }
  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();

var port = process.env.PORT || config.port || 9998

app.listen(port, null, function (err) {
  console.log('Pegg Uploader, at your service: http://localhost:' + port);
});


//app.use('/media', express.static(__dirname + '/media'));
app.use(connect.bodyParser());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


// Examples
app.get('/', function (req, res) {
  res.render('index', { config: config });
});

app.get('/s3policy/:filename', function (req, res) {
  console.log('get S3 Policy:' + req.params.filename);
  createS3Creds(req.params.filename, function (s3Credentials) {
    console.log(s3Credentials);
    res.json(s3Credentials);
  });
});

app.post('/process', function (req, res) {

  var location = req.body.location;
  var locParts = location.split('/');
  var filename = locParts[locParts.length - 1];

  var job = {
    "application_id": config.blitline_appId,
    "src": location,
    "functions": [
      {
        "name": "resize_to_fit",
        "params": {
          "width": 100
        },
        "save": {
          "image_identifier": "pegg-upload",
          "s3_destination": {
            "bucket": config.s3_bucket,
            "key": filename
          }
        }
      }
    ]
  };

  console.log(JSON.stringify(job));

  blitline.addJob(job);

  blitline.postJobs(function (response) {
    console.log(response);
    res.json(response);
  })

});


function createS3Creds(filename, cb) {
  var createS3Policy;
  var s3Signature;
  var s3Credentials;
  var s3PolicyBase64, _date, _s3Policy;
  var mimeType = mime.lookup(filename);

  _date = new Date();
  s3Policy = {
    "expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 12) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
    "conditions": [
      { "bucket": "pegg" },
      [ "starts-with", "$key", ""],
      { "acl": "public-read" },
      /*  { "success_action_redirect": "http://localhost:8888/#reply" }, */
      ["starts-with", "$Content-Type", mimeType],
      ["content-length-range", 0, 2147483648]
    ]
  };

  console.log("Secret: " + config.aws_secret_access_key);

  var bufPolicy = new Buffer(JSON.stringify(s3Policy)).toString('base64');

  s3Credentials = {
    s3PolicyBase64: bufPolicy,
    s3Signature: crypto.createHmac("sha1", config.aws_secret_access_key).update(bufPolicy).digest("base64"),
    s3Key: config.aws_access_id,
    /*    s3Redirect: "http://localhost:8888/#reply",*/
    s3Policy: s3Policy,
    s3Mime: mimeType,
    filename: filename
  }

  cb(s3Credentials);

}
