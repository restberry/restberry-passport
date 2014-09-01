var _ = require('underscore');
var LocalAuth = require('restberry-auth-local');
var passport = require('passport');
var utils = require('restberry-utils');


var DEFAULT_SCHEMA = {
    timestampLastLogIn: {type: Date, uneditable: true},
    timestampCreated: {type: Date, default: Date.now, uneditable: true},
    timestampUpdated: {type: Date, default: Date.now, uneditable: true},
};
var USER_MODEL_NAME = 'User';

function Auth() {
    this.auths = [];
    this.restberry = null;
    this.schema = DEFAULT_SCHEMA;
    this.User = null;

    this._setup();
};

Auth.prototype._setup = function() {
    var self = this;
    passport.serializeUser(function(user, next) {
        next(null, user.id);
    });
    passport.deserializeUser(function(id, next) {
        self.User.model.findById(id, next);
    });
};

Auth.prototype.apply = function(next) {
    var self = this;
    if (next)  next(self.restberry.web, passport);
    var User = self.restberry.model(USER_MODEL_NAME);
    self.User = User.setSchema(self.schema);
    _.each(self.auths, function(auth) {
        self.User.schema = auth.setupSchema(self.User.schema);
    });
    self.User.apply();
    _.each(self.auths, function(auth) {
        auth.setupRoutes();
    });
};

Auth.prototype.use = function(auth, config) {
    var self = this;
    self.auths.push(auth);
    auth.passport = passport;
    auth.restberry = self.restberry;
    auth.use(config, function(schema) {
        self.schema = utils.mergeDicts(self.schema, schema);
    });
    return self;
};

Auth.prototype.useLocal = function(config) {
    return this.use(LocalAuth, config);
};

module.exports = exports = new Auth;
