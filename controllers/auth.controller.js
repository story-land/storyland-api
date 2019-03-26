const createError = require('http-errors');
const User = require('../models/user.model');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports.register = (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        throw createError(409, 'User already registered');
      } else {
        return new User(req.body).save();
      }
    })
    .then(user => res.status(201).json(user))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  passport.authenticate('local-auth', (error, user, message) => {
    if (error) {
      next(error);
    } else if (!user) {
      throw createError(401, message);
    } else {
      req.login(user, error => {
        if (error) {
          next(error);
        } else {
          res.status(201).json(user);
        }
      });
    }
  })(req, res, next);
};

module.exports.logout = (req, res, next) => {
  req.logout();
  res.status(204).json();
};
