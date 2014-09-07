Restberry-Auth
==============

Authentication module for Restberry.

## Install

```
npm install restberry-auth
```

## Usage

```
var restberryAuth = require('restberry-auth');

restberry
    .use(restberryAuth.use(function(auth) {
        var passport = auth.passport;
    }));
```

*NOTE*: restberry-auth needs to use a child module to utilize the authentcation,
two example of these are restberry-auth-local and restberry-auth-google.
