var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var session = require('express-session');

var config = require('./config')

var mongoose = require('mongoose');
mongoose.connect(config.mongodb.connectionString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log("MongoDB connection is up. App ready")
});

var authProvider = require('./business_logic/authentication_handler')
var messageProcessor = require('./business_logic/message_processor')
var ruleEngine = require('./business_logic/rule_engine')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'superrrandomemegadrodron', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(authProvider.initialize());
app.use(authProvider.session());

var route_index = require('./routes/index')
var route_auth = require('./routes/auth')
var route_mqtt = require('./routes/mqtt')
var route_rules = require('./routes/rules')
var route_nodes = require('./routes/nodes')
var route_settings = require('./routes/settings')
var route_variables = require('./routes/variables')

app.use('/', route_index)
app.use('/auth', route_auth)
app.use('/mqtt', route_mqtt)
app.use('/rules', route_rules)
app.use('/nodes', route_nodes)
app.use('/settings', route_settings)
app.use('/variables', route_variables)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
