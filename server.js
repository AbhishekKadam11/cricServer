var express = require('express');
var path = require('path');
var request = require('request');
var async = require("async");
var app = express();

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

apiRoutes.get('/matchlist', function (req, res) {
    var currentmatch;
    var ongoing = [];
    request({
        url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.series.ongoing&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=',
        // headers: {
        //     'apikey': apikey
        // },
        json: true
    }, function (error, response, body) {
        if(!error) {
            if (response.statusCode === 200) {
                currentmatch = body.query.results.Series;
                // if(currentmatch !== 0) {
                //     currentmatch.forEach(function(item) {
                //         ongoing.push(item);
                //     //    console.log([item])
                //     })
                // }
                res.send(currentmatch);
            }
            else {
                res.send("Unable to fatch record", response);
            }
        } else {
            res.send("Server time out");
        }
    });
});

apiRoutes.get('/scorecardlive', function (req, res) {
    var currentmatch=[];
    var livematch;
    var ongoing = [];
    request({
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.scorecard.live&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=',
        json: true
    }, function (error, response, body) {
        if(!error) {
            if (response.statusCode === 200) {
                livematch = body.query.results['Scorecard'];
                livematch.forEach(function (match, key) {
                    var data = {};
                    for (var attributename in match) {
                        data[attributename] = match[attributename];
                    }
                    ongoing.push(data);
                });
                res.send(ongoing);
            }
            else {
                res.send("Unable to fatch record", response);
            }
        } else {
            res.send("Server time out");
        }
    });
});

apiRoutes.get('/pastmatches', function (req, res) {
    request({
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.series.past(0%2C5)&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=',
        json: true
    }, function (error, response, body) {
        if(!response) {
            console.log(response);
            if (body) {
                res.send(body.query.results['Match']);
            }
            else {
                res.send("Unable to fatch record", response);
            }
        } else {
            res.status(404).send("No defination found");
        }
    });
});

apiRoutes.get('/ongoingseries', function (req, res) {
    request({
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.series.ongoing&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=',
        json: true
    }, function (error, response, body) {
        console.log(response);
        if(!response) {
            if (body) {
                res.send(body.query.results);
            }
            else {
                res.send("Unable to fatch record", response);
            }
        } else {
            res.status(404).send("No defination found");

        }
    });
});

apiRoutes.get('/scorecard/:MatchId', function (req, res) {
    var innings;
    var inning = [];
    var inningData =[];
    var matchdata ={};
    var teams;
    var squad = [];
    var playerwithid;
    var test = [];
    var listinning = [];
    var scorecardtable;
    request({
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.scorecard%20where%20match_id%3D'+req.params.MatchId +'&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=',

        json: true
    }, function (error, response, body) {
        if(!error) {
            if (response.statusCode === 200) {
                innings = body.query.results.Scorecard.past_ings;
                teams = body.query.results.Scorecard.teams;
                if(Array.isArray(innings)) {
                    innings.forEach(function(inn){
                        inning.push(inn.d.a.t);
                    }) ;
                } else {
                    inning = innings.d.a.t;  //if their is only one inning done so far
                }

                for(var i=0; i< teams.length; i++ ){
                    var tm = teams[i].squad;
                    tm.forEach(function(squadData) {
                        squad.push(squadData);
                    });
                }
                if (Array.isArray(innings)) {
                    // for (var m = inning.length - 1; m > 0; m--) {
                    for (var m = 0; m < inning.length; m++) {
                        inning[m].forEach(function (player) {
                            squad.forEach(function (s) {
                                if (s['i'] == player['i']) {
                                    player['name'] = s['medium'];
                                    var matchinning = m;
                                    listinning.push(player);
                                }
                            });
                        });

                        inningData.push({no: m, batting: listinning});
                        listinning = [];
                    }
                } else {
                    inning.forEach(function (player) {
                        squad.forEach(function (s) {
                            if (s['i'] == player['i']) {
                                player['name'] = s['medium'];
                                var matchinning = m;
                                listinning.push(player);
                            }
                        });
                    });
                    inningData.push({no: 0, batting: listinning});
                }

                matchdata['scorecard'] = inningData;
           //     console.log(matchdata);
                res.send(matchdata);
            }
            else {
                res.send("Unable to fatch record", response);
            }
        } else {
            res.send("Server time out");
        }



    });
});

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
                if(!error) {
                    if (response.statusCode === 200) {
                        matchdetails['scoredata'] = body;
                        next(null, matchdetails);
                    }
                    else {
                        res.send("Unable to fatch record", response);
                    }
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
                if(!error && !body.error) {
                    if (response.statusCode === 200) {
                        matchdetails['balldetails'] = body;
                        next(null, matchdetails);
                        //    result = body;
                        //  res.send(JSON.stringify(body, undefined, 2));
                    }
                    else {
                        res.send("Unable to fatch record", response);
                    }
                }
            });
        },
        function (next) {
            request({
                url: 'http://cricapi.com/api/fantasySummary' + '?' + 'unique_id=' + req.params.u_id,
                headers: {
                    'apikey': apikey
                },
                json: true
            }, function (error, response, body) {
                if(!error) {
                    if (response.statusCode === 200) {
                        matchdetails['summary'] = body;
                        next(null, matchdetails);
                        res.send(matchdetails);
                        //    result = body;
                        //  res.send(JSON.stringify(body, undefined, 2));
                    }
                    else {
                        res.send("Unable to fatch record", response);
                    }
                }
            });
        }
    ], function (err, matchdetails) {
        console.log(matchdetails);
        // results is [firstData, secondData]
        //   console.log(matchscore,balldetails);
        res.send(matchdetails);
    });
});


apiRoutes.get('/playerstateist', function (req, res) {
    request({
        url: 'http://cricapi.com/api/playerStats' + '?' + 'pid=' + req.params.pid,
        headers: {
            'apikey': apikey
            // 'pid': req.pid
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

apiRoutes.get('/summary/:u_id', function (req, res) {
    request({
        url: 'http://cricapi.com/api/fantasySummary/'+ '?' + 'unique_id=' + req.params.u_id,
        headers: {
            'apikey': apikey
            // 'unique_id': req.uid
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

