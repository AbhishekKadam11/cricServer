var express = require('express');
var path = require('path');
var app = express();
// Start server
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
    console.log('listning to Port', app.get('port'));
});

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};
app.use(allowCrossDomain);

var apiRoutes = express.Router();
// connect the api routes under /api/*
app.use('/api', apiRoutes);

apiRoutes.get('/', function (req, res) {
   res.send('testapp');

});

apiRoutes.get('/matchlist', function (req, res) {
    request({
        url: 'https://query.yahooapis.com/v1/yql?q=desc%20cricket.scorecard.live&format=json&diagnostics=true&callback=',
        json: true
    }, function (error, response, body) {
        console.log(JSON.stringify(body, undefined, 2));
    });

});