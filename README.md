Restberry-Auth
==============

[![](https://img.shields.io/npm/v/restberry-auth.svg)](https://www.npmjs.com/package/restberry-auth) [![](https://img.shields.io/npm/dm/restberry-auth.svg)](https://www.npmjs.com/package/restberry-auth)

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

**NOTE:** `restberry-auth` needs to use a child module to utilize the authentcation,
two example of these are [`restberry-auth-local`](https://github.com/materik/restberry-auth-local) and [`restberry-auth-google`](https://github.com/materik/restberry-auth-google).

This will create a User model that can be accessed in two ways:

```
var User = restberry.model('User');
var User = restberry.auth.getUser();
```

To have a route be authenticate you must set `loginRequired` to true for that
route. You can do it in two ways:

```
restberry.model('Foo')
    .loginRequired()
    .routes.addCRUD();

restberry.model('Bar')
    .routes.addCRUD({
        loginRequired: true,
    });
```

**NOTE:** With the second approach you will have to set the config for every
individual route while the first approach will have it set to true automatically.

There are some hooks you can add to handle authentication, you need to provide a
function that returns a boolean to the callback which will say if the user has
authority to touch the object.

```
restberry.model('Foo')
    .loginRequired()
    .isAuthorized(function(next) {
        next(true || false);
    })
    .isAuthorizedToDelete(function(next) {
        ...
    })
    .isAuthorizedToCreate(function(next) {
        ...
    })
    .isAuthorizedToRead(function(next) {
        ...
    })
    .isAuthorizedToUpdate(function(next) {
        ...
    })
```

**NOTE:**
* The `isAuthorized` method will only be called if none of the other have been defined
  for their different purposes.
* If none of these have been set a predifined method will be used which tries to
  identify the user field of the object and compare that to the logged in user.
* `loginRequired` needs to be set to be enabled for any of these to be used.
