var _ = require('underscore');
var controller = require('./controller');
var passport = require('passport');

var DEFAULT_SCHEMA = {
    timestampLastLogIn: {type: Date, uneditable: true},
    timestampCreated: {type: Date, default: Date.now, uneditable: true},
    timestampUpdated: {type: Date, default: Date.now, uneditable: true},
};
var LOGOUT_PATH = '/logout';
var MODULE_GITHUB = 'github';
var MODULE_GOOGLE = 'google';
var MODULE_LOCAL = 'local';
var USER_MODEL_NAME = 'User';

function RestberryPassport() {
    this._configured = false;
    this._enableCallback = undefined;
    this._User = undefined;

    this.auths = [];
    this.passport = passport;
    this.restberry = undefined;
    this.schema = DEFAULT_SCHEMA;
};

RestberryPassport.prototype._enable = function() {
    var self = this;
    if (self._enableCallback)  self._enableCallback(self);
    passport.serializeUser(function(user, next) {
        next(undefined, user.getId());
    });
    passport.deserializeUser(function(id, next) {
        self.getUser()._findById(id, function(err, _obj) {
            if (err) {
                next(err);
            } else {
                next(undefined, self.getUser().obj(_obj));
            }
        });
    });
    _.each(this.auths, function(auth) {
        auth.enable(function(schema) {
            self.schema = _.extend(self.schema, schema);
        });
    });
};

RestberryPassport.prototype._setupRoutes = function() {
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

RestberryPassport.prototype._setupUser = function(schema) {
    var self = this;
    _.each(this.auths, function(auth) {
        self._User = auth.setupUser(self._User);
    });
};

RestberryPassport.prototype.config = function(next) {
    if (!this._configured) {
        this._configured = true;
        this._enableCallback = next;
    }
    return this;
};

RestberryPassport.prototype.enable = function(next) {
    if (this.restberry.model(USER_MODEL_NAME).model) {
        throw new Error('Passport has already been enabled');
    }
    if (!this.auths.length) {
        throw new Error('Need to set at least one passport, see for example ' +
                        'restberry-passport-local');
    }
    this._enable();
    this._User = this.restberry
        .model(USER_MODEL_NAME)
        .schema(this.schema)
        .loginRequired();
    this._setupRoutes();
    this._setupUser();
    return this;
};

RestberryPassport.prototype.getModule = function(moduleName) {
    switch (moduleName) {
        case MODULE_GITHUB:
            return require('restberry-passport-github');
        case MODULE_GOOGLE:
            return require('restberry-passport-google');
        case MODULE_LOCAL:
            return require('restberry-passport-local');
        default:
            throw new Error('Illegal module');
    }
};

RestberryPassport.prototype.getUser = function() {
    if (this._User)  return this._User;
    this._User = this.restberry.model(USER_MODEL_NAME);
    return this.getUser();
};

RestberryPassport.prototype.isUserModel = function(model) {
    return this.getUser().name === model.name;
};

RestberryPassport.prototype.use = function(module, callback) {
    if (!module) {
        return this;
    } else if (_.isString(module)) {
        module = this.getModule(module);
    }
    if (RestberryPassport.canApply(module)) {
        module = module.config(callback);
        module.passport = passport;
        this.auths.push(module);
    } else {
        throw new Error('Illegal module');
    }
    return this;
};

RestberryPassport.canApply = function(auth) {
    return _.isFunction(auth.config) &&
           _.isFunction(auth.enable) &&
           _.isFunction(auth.setupRoutes) &&
           _.isFunction(auth.setupUser);
};

module.exports = exports = new RestberryPassport;
