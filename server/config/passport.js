const passport = require('passport'),
      Users = require('../models/user'),
      config = require('./database'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(
  function(username, password, done) {
    Users.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false, { name: 'NoUser' });
      } else {
        user.comparePassword(password, (err, match) => {
          if (err) {
            return done(err)
          } else if (!match) {
            return done(null, false, {name: 'WrongPass'})
          } else {
            return done(null, user)
          }
        })
      }
    })
  }
))

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: config.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, function(auth, done) {
  Users.findOne({"username": auth.user}, function(err, user) {
    if (err) {
      return done(err, false);
    } else if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin)
