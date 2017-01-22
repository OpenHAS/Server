var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserManager = require('../dao/user_manager');
var SettingsManager = require('../dao/settings_manager')

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

passport.ensureAuthenticatedForDashboard = function (req, res, next) {

  //1. case: user is logged in
  //2. case: user is not logged in, but anon access enabled for the dashboard
  if (req.isAuthenticated()) {
    return next()
  } else  {

    SettingsManager.getValue(SettingsManager.AnonymousDashboardAccess, "false", function (savedAnonAccess) {
      if (savedAnonAccess == "true") {
        return next()
      } else {
        res.redirect('/auth/login')
      }
    })
  }
};

//this method should check if the request is coming from particle, and having the correct token
passport.ensureAuthenticatedForParticle = function(req, res, next) {

  var sentToken = req.get('Authentication')

  //no token was sent
  if (sentToken == undefined) {
    res.sendStatus(403)
    return
  }

  //compare to saved token
  SettingsManager.getValue(SettingsManager.ParticleSecurityToken, "", function (savedParticleToken) {
    if (savedParticleToken == sentToken) {
      return next()
    } else {
      res.sendStatus(403)
    }
  })
}

module.exports = passport;
