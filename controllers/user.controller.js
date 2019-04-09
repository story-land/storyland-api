const createError = require('http-errors');
const User = require('../models/user.model');
const UserBook = require('../models/user-book.model');
const Book = require('../models/book.model');
const Social = require('../models/social.model');
const Goal = require('../models/goal.model');

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .populate('dailyGoals')
    .populate('following')
    .populate('followers')
    .then(user => {
      if (!user) {
        throw createError(404, 'user not found');
      } else {
        res.json(user);
      }
    })
    .catch(next);
};

module.exports.getAllUsers = (req, res, next) => {
  User.find()
    .populate('dailyGoals')
    .populate('following')
    .populate('followers')
    .populate('userbooks')
    .then(users => {
      res.json(users);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  delete req.body.email;
  const user = req.user;
  Object.keys(req.body).forEach(prop => (user[prop] = req.body[prop]));
  if (req.file) user.avatarURL = req.file.secure_url;
  user
    .save()
    .then(user => res.status(202).json(user))
    .catch(next);
};

module.exports.getUserBooks = (req, res, next) => {
  const search = {
    user: req.user.id
  };

  if (req.query.state) {
    search.state = req.query.state;
  }

  UserBook.find(search)
    .populate('book')
    .then(userBooks => {
      res.json(userBooks.map(x => x.book));
    })
    .catch(next);
};

module.exports.getSocialUsers = (req, res, next) => {
  User.findById(req.params.id)
    .populate('following')
    .populate('followers')
    .then(user => {
      const social = {
        following: user.following ? user.following : [],
        followers: user.followers ? user.followers : []
      };
      res.json(social);
    });
};

module.exports.followUser = (req, res, next) => {
  const social = {
    follower: req.user.id,
    followed: req.params.id
  };

  Social.findOne(social)
    .then(relation => {
      if (relation) {
        res.status(204).json();
      } else {
        const newSocial = new Social(social);
        newSocial.save().then(follow => {
          res.status(201).json(follow);
        });
      }
    })
    .catch(next);
};

module.exports.unfollowUser = (req, res, next) => {
  const social = {
    follower: req.user.id,
    followed: req.params.id
  };

  Social.findOne(social)
    .then(relation => {
      if (relation) {
        Social.findByIdAndDelete(relation.id)
          .then(follow => res.status(204).json())
          .catch(next);
      } else {
        res.status(204).json();
      }
    })
    .catch(next);
};

module.exports.getStateBook = (req, res, next) => {
  const search = {
    user: req.user.id,
    book: req.params.id
  };
  UserBook.find(search)
    .then(userBook => {
      if (userBook[0]) {
        res.json(userBook[0].state);
      } else {
        res.json('');
      }
    })
    .catch(next);
};

module.exports.createUserBook = (req, res, next) => {
  const userBook = new UserBook({
    user: req.user.id,
    book: req.params.id,
    state: req.query.state || 'pending'
  });

  if (userBook.state === 'pending') {
    UserBook.findOne({ user: userBook.user, book: userBook.book })
      .then(relation => {
        if (!relation) {
          userBook.save().then(userBook => {
            changeFavGenres(req.user.id, req.params.id);
            res
              .status(201)
              .json(userBook)
              .json('Book added to pending books');
          });
        } else {
          if (relation.state === 'read' || relation.state === 'reading') {
            UserBook.findByIdAndUpdate(
              relation.id,
              { state: userBook.state },
              {
                new: true
              }
            )
              .then(userbook => {
                changeFavGenres(req.user.id, req.params.id);
                res.status(200).json('Status book modified to pending');
              })
              .catch(next);
          } else {
            UserBook.findByIdAndRemove(relation.id)
              .then(userbook =>
                res.status(204).json('Book removed from your user')
              )
              .catch(next);
          }
        }
      })
      .catch(next);
  }

  if (userBook.state === 'read') {
    UserBook.findOne({ user: userBook.user, book: userBook.book })
      .then(relation => {
        if (!relation) {
          userBook.save().then(userBook => {
            changeFavGenres(req.user.id, req.params.id);
            res
              .status(201)
              .json(userBook)
              .json('Book added to read books');
          });
        } else {
          if (relation.state === 'pending' || relation.state === 'reading') {
            UserBook.findByIdAndUpdate(
              relation.id,
              { state: userBook.state },
              {
                new: true
              }
            )
              .then(userbook => {
                changeFavGenres(req.user.id, req.params.id);
                res.status(200).json('Status book modified to read');
              })
              .catch(next);
          } else {
            UserBook.findByIdAndRemove(relation.id)
              .then(userbook =>
                res.status(204).json('Book removed from your user')
              )
              .catch(next);
          }
        }
      })
      .catch(next);
  }

  if (userBook.state === 'reading') {
    UserBook.findOne({ user: userBook.user, book: userBook.book })
      .then(relation => {
        if (!relation) {
          userBook.save().then(userBook => {
            changeFavGenres(req.user.id, req.params.id);
            res
              .status(201)
              .json(userBook)
              .json('Book added to reading books');
          });
        } else {
          if (relation.state === 'pending' || relation.state === 'read') {
            UserBook.findByIdAndUpdate(
              relation.id,
              { state: userBook.state },
              {
                new: true
              }
            )
              .then(userbook => {
                changeFavGenres(req.user.id, req.params.id);
                res.status(200).json('Status book modified to reading');
              })
              .catch(next);
          } else {
            UserBook.findByIdAndRemove(relation.id)
              .then(userbook =>
                res.status(204).json('Book removed from your user')
              )
              .catch(next);
          }
        }
      })
      .catch(next);
  }

  function changeFavGenres(user, book) {
    Book.findById(book).then(book => {
      const genre = book.genres[0];
      User.findById(user)
        .then(user => {
          let actualGenres = user.favGenres;
          if (!actualGenres.includes(genre)) {
            if (actualGenres.length >= 2) {
              actualGenres.pop();
              actualGenres.unshift(genre);
              User.findByIdAndUpdate(
                user.id,
                { favGenres: actualGenres },
                {
                  new: true
                }
              )
                .then()
                .catch(error => console.log(error));
            } else {
              actualGenres.unshift(genre);
              User.findByIdAndUpdate(
                user.id,
                { favGenres: actualGenres },
                {
                  new: true
                }
              )
                .then()
                .catch(error => console.log(error));
            }
          }
        })
        .catch(error => console.log(error));
    });
  }
};

module.exports.getGoals = (req, res, next) => {
  User.findById(req.user.id)
    .populate('dailyGoals')
    .then(user => res.json(user.dailyGoals))
    .catch(next);
};

module.exports.getLastGoals = (req, res, next) => {
  const { days } = req.params;
  let date = new Date();
  date.setDate(date.getDate() - days);
  const userId = req.user.id;
  Goal.find({ user: userId, updatedAt: { $gt: date } })
    .limit(Number(days))
    .sort({ updatedAt: -1 })
    .then(goals => res.json(goals))
    .catch(next);
};

module.exports.createGoal = (req, res, next) => {
  const goalBody = {
    ...req.body,
    user: req.user.id
  };

  const today = new Date();
  const todayObj = {
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate()
  };

  User.findById(req.user.id)
    .populate('dailyGoals')
    .then(user => {
      const findedGoal = user.dailyGoals.find(({ createdAt }) => {
        const goalDate = new Date(createdAt);
        return (
          goalDate.getFullYear() === todayObj.year &&
          goalDate.getMonth() === todayObj.month &&
          goalDate.getDate() === todayObj.day
        );
      });
      if (findedGoal) {
        Goal.findByIdAndUpdate(findedGoal.id, goalBody, { new: true }).then(
          goal => {
            res.json(goal);
          }
        );
      } else {
        const goal = new Goal(goalBody);
        goal
          .save()
          .then(goal => res.status(201).json(goal))
          .catch(next);
      }
    })
    .catch(next);
};
