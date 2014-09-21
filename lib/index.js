var _ = require('underscore');
var controller = require('./controller');
var modules = require('restberry-modules');
var passport = require('passport');


var DEFAULT_SCHEMA = {
    timestampLastLogIn: {type: Date, uneditable: true},
    timestampCreated: {type: Date, default: Date.now, uneditable: true},
    timestampUpdated: {type: Date, default: Date.now, uneditable: true},
};
var LOGOUT_PATH = '/logout';
var USER_MODEL_NAME = 'User';

function RestberryAuth() {
    this._enableCallback = null;
    this._User = null;

    this.auths = [];
    this.passport = passport;
    this.restberry = null;
    this.schema = DEFAULT_SCHEMA;

    this._setup();
};

RestberryAuth.__className__ = 'RestberryAuth';
RestberryAuth.prototype.__class__ = RestberryAuth;

RestberryAuth.prototype._enable = function() {
    var self = this;
    if (_enableCallback)  _enableCallback(self);
    _.each(this.auths, function(auth) {
        auth.enable(function(schema) {
            self.schema = _.extend(self.schema, schema);
        });
    });
};

RestberryAuth.prototype._setup = function() {
    var self = this;
    passport.serializeUser(function(user, next) {
        next(null, user.getId());
    });
    passport.deserializeUser(function(id, next) {
        self.getUser()._findById(id, function(err, _obj) {
            if (err) {
                next(err);
            } else {
                next(null, self.getUser().obj(_obj));
            }
        });
    });
};

RestberryAuth.prototype._setupRoutes = function() {
    var User = this.getUser();
    User.routes.addCustomRoute({
        _controller: controller.logout,
        isLoginRequired: false,
        path: LOGOUT_PATH,
    });
    _.each(this.auths, function(auth) {
        auth.setupRoutes();
    });
};

RestberryAuth.prototype._setupUser = function(schema) {
    var self = this;
    _.each(this.auths, function(auth) {
        self._User = auth.setupUser(self._User);
    });
};

RestberryAuth.prototype.enable = function(next) {
    if (this.restberry.model(USER_MODEL_NAME).model) {
        throw new Error('Authentication has already been enabled');
    }
    this._enable();
    this._User = this.restberry.model(USER_MODEL_NAME)
        .schema(this.schema)
        .loginRequired();
    this._setupRoutes();
    this._setupUser();
    return this;
};

RestberryAuth.prototype.getUser = function() {
    if (this._User)  return this._User;
    this._User = this.restberry.model(USER_MODEL_NAME);
    return this.getUser();
};

RestberryAuth.prototype.isUserModel = function(model) {
    return this.getUser().name === model.name;
};

RestberryAuth.prototype.use = function(module) {
    var self = this;
    if (_.isFunction(module)) {
        _enableCallback = module;
    } else {
        module.passport = passport;
        if (modules.isAuth(module)) {
            self.auths.push(module);
        } else {
            throw new Error('Illegal module');
        }
    }
    return this;
};

module.exports = exports = new RestberryAuth;
