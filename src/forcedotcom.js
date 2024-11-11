const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const request = require('request-promise');
const session = require('express-session');

// loading env vars from .env file
require('dotenv').config();

const app = express();

const auth0Strategy = new Auth0Strategy(
  {
    domain: 'dev-8w90vns0.us.auth0.com',
    clientID: 'J9ScUhCYVmhfBw12cG7AUD4v29eQuSol',
    clientSecret:
      'mQPSszw8_KfhwVmr4uWXb8MvdiLEbaWlsuF8XL6vcFad8Vosuyn0xXg-HA-mgYJ9',
    callbackURL: 'http://localhost:3000/callback'
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    profile.idToken = extraParams.id_token;
    console.log(`accessToken=${accessToken}`);
    console.log(`profile=${JSON.stringify(profile)}`);
    console.log(`extraParams=${JSON.stringify(extraParams)}`);

    console.log(`done=${JSON.stringify(done)}`);

    return done(null, profile);
  }
);

passport.use(auth0Strategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(16).toString('hex')));
app.use(
  session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false
  })
);
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', (req, res) => {
  console.log(`req.session.passport=${JSON.stringify(req.session.passport)}`);
  const { user } = req.session.passport;
  res.render('profile', {
    idToken: user.idToken,
    decodedIdToken: user._json
  });
});

app.get(
  '/login',
  passport.authenticate('auth0', {
    scope: 'openid email profile'
  })
);

app.get('/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect('/profile');
    });
  })(req, res, next);
});

app.post('/callback', async (req, res) => {
  res.status(501).send();
});

app.get('/to-dos', async (req, res) => {
  res.status(501).send();
});

app.get('/remove-to-do/:id', async (req, res) => {
  res.status(501).send();
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
