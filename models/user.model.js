const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const Goal = require('../models/goal.model');
const Book = require('../models/book.model');

const emailPattern = /(.+)@(.+){2,}\.(.+){2,}/i;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d){6,}/;

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
    pagesGoal: {
      type: Number,
      default: 40
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

userSchema.virtual('readBooks', {
  ref: Book.modelName,
  localField: '_id',
  foreignField: 'readByUser',
  options: { sort: { position: -1 } }
});

userSchema.virtual('pendingBooks', {
  ref: Book.modelName,
  localField: '_id',
  foreignField: 'pendingForUser',
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
