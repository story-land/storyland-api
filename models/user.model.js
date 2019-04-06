const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const Goal = require('../models/goal.model');
const Book = require('../models/book.model');
const UserBook = require('../models/user-book.model');

const emailPattern = /(.+)@(.+){2,}\.(.+){2,}/i;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d){6,}/;
const URL_PATTERN = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: emailPattern
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      validate: passwordPattern
    },
    avatarURL: {
      type: String,
      match: [URL_PATTERN, 'Invalid avatar URL pattern']
    },
    pagesGoal: {
      type: Number,
      default: 40
    },
    favGenres: {
      type: Array
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.virtual('dailyGoals', {
  ref: Goal.modelName,
  localField: '_id',
  foreignField: 'user',
  options: { sort: { position: -1 } }
});

userSchema.virtual('following', {
  ref: 'Social',
  localField: '_id',
  foreignField: 'follower',
  options: { sort: { position: -1 } }
});

userSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) {
    next();
  } else {
    bcrypt
      .genSalt(SALT_WORK_FACTOR)
      .then(salt => {
        return bcrypt.hash(user.password, salt).then(hash => {
          user.password = hash;
          next();
        });
      })
      .catch(error => next(error));
  }
});

userSchema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
