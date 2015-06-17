var logger = require('restberry-logger');
var httpStatus = require('http-status');


module.exports = {
    logout: function() {
        return function(req, res, next) {
            if (req.user) {
                logger.info('SESSION', 'logout', req.user.id);
                req.logout();
            }
            res.status(httpStatus.NO_CONTENT);
            res._body = {};
            next({});
        };
    },
};
