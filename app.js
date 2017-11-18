const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')
cors({credentials: true, origin: true});

// set up database and models
const dbManager = require('./helpers/dbManager.js');
const passport = require('./helpers/passportStrategies.js');

const index = require('./routes/index');
const users = require('./routes/users');
const api = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser({limit: '4MB'}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'uploads')));

app.use('/', index);
app.use('/users', users);

app.use('/api/', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const formatError = require('./helpers/errors.js').formatError;

  console.log(`answering with error: ${JSON.stringify(formatError(err))}`);

  // return errors as json1.1 responses
  // if error is authentication related, delay response for 2 seconds.
  if (err.type === 'auth') {setTimeout(()=>{res.status(err.status || 500).json({code: err.status || 500, status: 'error', errors: [formatError(err)]})}, 2000)}
  else {res.status(err.status || 500).json({code: err.status || 500, status: 'error', errors: [formatError(err)]});}
  // res.render('error');
});

module.exports = app;
