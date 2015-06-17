var cookieParser = require('cookie-parser');
var restberry = require('restberry');
var restberryPassport = require('restberry-passport');
var session = require('express-session');

var FACEBOOK_CLIENT_ID = '444105679101207';
var FACEBOOK_CLIENT_SECRET = '49678fd6af105794a5f07a5dbcafeb32';
var GITHUB_CLIENT_ID = 'f5080bcfde3e1c43ffcd';
var GITHUB_CLIENT_SECRET = 'b42090d5643e0dc9154b0c209169ca052da4d8ff';
var GOOGLE_CLIENT_ID = '189276784584-dnhd9l2t6sac2954qvbjbaj1r8h40b68.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = 'C6yXezIU3DnXE4TUj6HwAoIk';
var TWITTER_CONSUMER_KEY = 'tjV7hrEDLvw8zMvbuzQ8Quylt';
var TWITTER_CONSUMER_SECRET = 'iMd2fisBG7IKiqPaU2xyhoDeWGTDT1M2gmQ8ZdB9ijatcygi7p';

var auth = restberryPassport
    .config(function(auth) {
        var app = restberry.waf.app;
        app.use(auth.passport.initialize());
        app.use(auth.passport.session());
    })
    .use('facebook', {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
    })
    .use('github', {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
    })
    .use('google', {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
    })
    .use('local')
    .use('twitter', {
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
    });

restberry
    .config({
        apiPath: '/api/v1',
        port: 6000,
        verbose: true,
    })
    .use('express', function(waf) {
        var app = waf.app;
        app.use(cookieParser());
        app.use(session({
            resave: false,
            saveUninitialized: false,
            secret: 'restberry',
        }));
    })
    .use(auth)
    .listen('RESTBERRY');

restberry.model('User')
    .loginRequired()
    .routes
        .addReadManyRoute({
            actions: {
                me: function(req, res, next) {
                    var User = restberry.auth.getUser();
                    req.user.expandJSON();
                    req.user.toJSON(next);
                },
            },
        });
