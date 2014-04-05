/* Sample code to perform trivial operation on Blitline */
/* Requires an APPLICATION_ID which you can get from blitline.com for free and without obligation, or e
 ven an email. */

var fs = require('node-fs'),
    Blitline = require('./lib/blitline'),
    blitline = new Blitline(),
    express = require('express'),
    app = express();

app.use(express.bodyParser());

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
    var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
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
    console.log('Blitline, at your service: http://localhost:' + port);
});

app.post('/process', function(req, res){

    blitline.addJob({
        "application_id": config.blitline_appId,
        "src":  req.body.url,
        "functions": [
            {
                "name": "resize_to_fit",
                "params": {
                    "width": 100
                },
                "save": {
                    "image_identifier": config.s3_bucket,
                    "s3_destination" : {
                        "bucket" : config.s3_bucket,
                        "key" : req.body.filename
                    }
                }
            }
        ]
    });

});