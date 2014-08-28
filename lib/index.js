var LocalAuth = require('restberry-auth-local');
var passport = require('passport');

var DEFAULT_SCHEMA = {
    timestampLastLogIn: {type: Date, uneditable: true},
    timestampCreated: {type: Date, default: Date.now, uneditable: true},
    timestampUpdated: {type: Date, default: Date.now, uneditable: true},
};
var USER_MODEL_NAME = 'USER';

function Auth(restberry) {
    this.schema = DEFAULT_SCHEMA;
    this.user = restberry.model(USER_MODEL_NAME);

    this._setup();
};

Auth.prototype._setup = function() {
    var self = this;
    passport.serializeUser(function(user, next) {
        next(null, user.id);
    });
    passport.deserializeUser(function(id, next) {
        self.user.findById(id, next);
    });
};

Auth.prototype.apply = function() {
    var self = this;
    self.user.setSchema(self.schema).apply();
};

Auth.prototype.useLocal = function(config) {
    var self = this;
    LocalAuth(this, passport).use(config, function(schema) {
        this.schema = utils.mergeDicts(this.schema, schema);
    });
    return self;
};

module.exports = exports = new Auth;
