'use strict';

var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var util = require('util');
var bunyan = require('bunyan');
var mongoose = require('mongoose');
var config = require('./config');
var ProfileApi = require('./apis/profiles');
var User = require('./models/user');

// Controllers
var profiles = require('./controllers/profilesController');

var MongoStore = require('connect-mongo')(expressSession);

var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

var log = bunyan.createLogger({
  name: 'MCSC: Child Finder'
});

passport.serializeUser(function (user, done) {
  done(null, user.oid);
});

passport.deserializeUser(function (oid, done) {
  findByOid(oid, function (err, user) {
    done(err, user);
  });
});

var users = [];

var findByOid = function (oid, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

passport.use(new OIDCStrategy({
  identityMetadata: config.creds.identityMetadata,
  clientID: config.creds.clientID,
  responseType: config.creds.responseType,
  responseMode: config.creds.responseMode,
  redirectUrl: config.creds.redirectUrl,
  allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
  clientSecret: config.creds.clientSecret,
  validateIssuer: config.creds.validateIssuer,
  isB2C: config.creds.isB2C,
  issuer: config.creds.issuer,
  passReqToCallback: config.creds.passReqToCallback,
  scope: config.creds.scope,
  loggingLevel: config.creds.loggingLevel,
  nonceLifetime: config.creds.nonceLifetime,
  nonceMaxAmount: config.creds.nonceMaxAmount,
  useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
  cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
  clockSkew: config.creds.clockSkew,
},
  function (iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByOid(profile.oid, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          // "Auto-registration"
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      });
    });
  }
));

var app = express();
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(methodOverride());
app.use(cookieParser());
app.use('/img', express.static(__dirname + '/img'));
app.use('/css', express.static(__dirname + '/css'));

// set up session middleware
if (config.useMongoDBSessionStore) {
  mongoose.connect(config.databaseUri);
  app.use(express.session({
    secret: 'secret',
    cookie: { maxAge: config.mongoDBSessionMaxAge * 1000 },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      clear_interval: config.mongoDBSessionMaxAge
    })
  }));
} else {
  app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};

app.get('/login',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,                      // required
        resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
        customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
        failureRedirect: '/'
      }
    )(req, res, next);
  },
  function (req, res) {
    log.info('Login was called in the Sample');
    res.redirect('/');
  });

app.get('/auth/openid/return',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,                      // required
        failureRedirect: '/'
      }
    )(req, res, next);
  },
  function (req, res) {
    log.info('We received a return from AzureAD.');
    res.redirect('/');
  });

app.post('/auth/openid/return',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,                      // required
        failureRedirect: '/'
      }
    )(req, res, next);
  },
  function (req, res) {
    log.info('We received a return from AzureAD.');
    res.redirect('/');
  });

app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    req.logOut();
    res.redirect(config.destroySessionUrl);
  });
});

// APP
app.get('/', function (req, res) {
  var user = new User(req);
  if (user.isAuthenticated) {
    new ProfileApi(config.docDB).getList().then((profiles) => {
      res.render('index', {
        user: user,
        profiles: profiles
      });      
    })
  }
  else {
    res.render('index', {
        user: user
    });    
  }
});

app.get('/profile/:id', ensureAuthenticated, profiles.show);


// APIS
app.get('/api/profiles', ensureAuthenticated, profiles.list);
app.put('/api/notify', ensureAuthenticated, function (req, res) {
  res.end(200);
})

app.listen(config.Port);