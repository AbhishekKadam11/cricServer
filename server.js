var express = require('express');
var path = require('path');
var request = require('request');
var async = require("async");
var app = express();

//static value
var apikey = 'E08rQGFIbOPj24fZOywW5RQijTq1';

// Start server
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
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
    console.log('test');
    res.send('testapp');

});

var countries = ['India', 'Pakistan', 'Afghanistan', 'African Union', 'Australia', 'Bangladesh', 'Barbados', 'Bermuda', 'Canada', 'Ireland',
    'Kenya', 'Netherlands', 'New Zealand', 'South Africa', 'Spain', 'Sri Lanka', 'Swaziland', 'United Arab Emirates', 'Zimbabwe',
    'England', 'West Indies'];

apiRoutes.get('/matchlist', function (req, res) {
    var matches = [];
    request({
        url: 'http://cricapi.com/api/matches/',
        headers: {
            'apikey': apikey
        },
        json: true
    }, function (error, response, body) {
        if (response.statusCode === 200) {
            var data = response['body']['matches'];
            data.forEach(function (item) {
                countries.forEach(function (c) {
                    if (item['team-1'] === c)
                       matches.push(item);
                })
            });
            //console.log(data);
            res.send(matches);
        }
        else {
            res.send("Unable to fatch record", response);
        }

    });
});

// apiRoutes.get('/scorelist/:u_id', function (req, res) {
//    // res.send(JSON.stringify(req));
//  //   console.log(req);
//     request({
//         url: 'http://cricapi.com/api/cricketScore' + '?' + 'unique_id=' + req.params.u_id,
//         headers: {
//             'apikey': apikey
//         },
//         json: true
//     }, function (error, response, body) {
//         if (response.statusCode === 200) {
//             ballSummary(req.params.u_id, function(result){
//                 var balldetails = result;
//             });
//
//             var matchscore = body;
//             res.send(JSON.stringify(body, undefined, 2));
//         }
//         else {
//             res.send("Unable to fatch record", response);
//         }
//
//     });
// });

apiRoutes.get('/scorelist/:u_id', function (req, res) {
    var matchdetails = {};
    async.parallel([
        function (next) {
            request({
                url: 'http://cricapi.com/api/cricketScore' + '?' + 'unique_id=' + req.params.u_id,
                headers: {
                    'apikey': apikey
                },
                json: true
            }, function (error, response, body) {
                if (response.statusCode === 200) {
                    matchdetails['scoredata'] = body;
                    next(null, matchdetails);
                }
                else {
                    res.send("Unable to fatch record", response);
                }
            });
        },
        function (next) {
            request({
                url: 'http://cricapi.com/api/ballByBall' + '?' + 'unique_id=' + req.params.u_id,
                headers: {
                    'apikey': apikey
                },
                json: true
            }, function (error, response, body) {
                if (response.statusCode === 200) {
                    matchdetails['balldetails'] = body;
                    next(null, matchdetails);
                    //    result = body;
                    //  res.send(JSON.stringify(body, undefined, 2));
                }
                else {
                    res.send("Unable to fatch record", response);
                }
            });

        }], function (err, results) {
        // results is [firstData, secondData]
        //   console.log(matchscore,balldetails);
        res.send(matchdetails);
    });
});


apiRoutes.get('/playerstateist', function (req, res) {
    request({
        url: 'http://cricapi.com/api/playerStats?pid=35320',
        headers: {
            'apikey': apikey,
            'pid': req.pid
        },
        json: true
    }, function (error, response, body) {
        if (response.statusCode === 200) {
            res.send(JSON.stringify(body, undefined, 2));
        }
        else {
            res.send("Unable to fatch record", response);
        }

    });
});

// apiRoutes.get('/ballbyball', function (req, res) {
//     request({
//         url: 'http://cricapi.com/api/ballByBall',
//         headers: {
//             'apikey': apikey,
//             'unique_id': req.uid
//         },
//         json: true
//     }, function (error, response, body) {
//         if (response.statusCode === 200) {
//             res.send(JSON.stringify(body, undefined, 2));
//         }
//         else {
//             res.send("Unable to fatch record", response);
//         }
//
//     });
// });

apiRoutes.get('/summary', function (req, res) {
    request({
        url: 'http://cricapi.com/api/fantasySummary/',
        headers: {
            'apikey': apikey,
            'unique_id': req.uid
        },
        json: true
    }, function (error, response, body) {
        if (response.statusCode === 200) {
            res.send(JSON.stringify(body, undefined, 2));
        }
        else {
            res.send("Unable to fatch record", response);
        }

    });
});

// apiRoutes.get('/livescore', function (req, res) {
//     request({
//         url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.scorecard.live&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=',
//         // headers: {
//         //     'apikey': apikey,
//         //     'pid': req.pid
//         // },
//         json: true
//     }, function (error, response, body) {
//         if (response.statusCode === 200) {
//             res.send(JSON.stringify(body, undefined, 2));
//         }
//         else {
//             res.send("Unable to fatch record", response);
//         }
//
//     });
// });