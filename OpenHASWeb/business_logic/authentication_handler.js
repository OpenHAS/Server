var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserManager = require('../dao/user_manager');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new LocalStrategy(

  function(userid, password, done) {

    UserManager.authenticate(userid, password, function(foundUser){
      if (foundUser != null) {
        done(null, foundUser)
      } else {
        done(null, false)
      }
    })
  }
));

passport.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/login')
};

module.exports = passport;
