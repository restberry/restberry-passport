Restberry-Passport
==================

[![](https://img.shields.io/npm/v/restberry-passport.svg)](https://www.npmjs.com/package/restberry-passport) [![](https://img.shields.io/npm/dm/restberry-passport.svg)](https://www.npmjs.com/package/restberry-passport)

Passport wrapper for Restberry.

## Install

```
npm install restberry-passport
```

## Usage

```
var restberryPassport = require('restberry-passport');

restberry
    .use(restberryPassport.config({
        additionalFields: {
            ...
        },
    }, function(auth) {
        var passport = auth.passport;
        ...
    }));
```

This will create a new route for logging out:
- GET /logout

**NOTE:** `restberry-passport` needs to use a child module to utilize the authentcation,
two example of these are [`restberry-passport-local`](https://github.com/materik/restberry-passport-local) and [`restberry-passport-google`](https://github.com/materik/restberry-passport-google).

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
    .routes.addCRUDRoutes();

restberry.model('Bar')
    .routes.addCRUDRoutes({
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

## Run the tests

The tests require you to have the node test app running on port 6000 and
the the index.html test file accessable at port 6001 on your localhost.
There is an nginx-conf file that is setup for this in the test directory.
Then simply run:

```
npm test
```
