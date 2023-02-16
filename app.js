var createError = require('http-errors');
require("dotenv").config();
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const url = "mongodb://0.0.0.0:27017/instachamp";
mongoose.connect(url, {
  useNewUrlParser: true,
});
const con = mongoose.connection;
con.on('open', () => {
  console.log('Database Connected');
});

var usersRouter = require('./controllers/users');
var adminRouter = require('./controllers/admin');
var superadminRouter = require('./controllers/superadmin');


var app = express();
var sessionVar;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
// app.use("/img",express.static(__dirname + '/public/images/test'));
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir777",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

app.use('/', usersRouter);
app.use('/admin-login', adminRouter);
app.use('/admin', adminRouter);
app.use('/admin', function (req, res, next) {
  sessionVar = req.session;
  if (!sessionVar.userdetail) {
    res.redirect('/admin-login/');
  } else {
    next();
  }
});

app.use('/superadmin-login', superadminRouter);
app.use('/superadmin', superadminRouter);
app.use('/superadmin', function (req, res, next) {
  sessionVar = req.session;
  if (!sessionVar.userdetail) {
    res.redirect('/superadmin-login/');
  } else {
    next();
  }
});


app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
