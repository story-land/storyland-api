require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

const passport = require('passport');

require('./configs/db.config');
const session = require('./configs/session.config');
const cors = require('./configs/cors.config');
require('./configs/passport.config');

const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const userRoutes = require('./routes/users.routes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors);
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/books', booksRoutes);
app.use('/users', userRoutes);
app.use('/', authRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(error, req, res, next) {
  console.error(error);

  res.status(error.status || 500);

  const data = {};

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400);
    for (field of Object.keys(error.errors)) {
      error.errors[field] = error.errors[field].message;
    }
    data.errors = error.errors;
  } else if (error instanceof mongoose.Error.CastError) {
    error = createError(404, 'Resource not found');
  }

  data.message = error.message;
  res.json(data);
});

module.exports = app;
