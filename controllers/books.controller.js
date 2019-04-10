const createError = require('http-errors');
const booksService = require('../services/books.service');
const visionService = require('../services/vision.service');
const Book = require('../models/book.model');

module.exports.getBooks = (req, res, next) => {
  const { rating, year } = req.query;
  let { genres } = req.query;
  const query = {};
  if (rating) {
    query.googleRating = { $gte: rating };
  }
  if (genres) {
    if (genres.includes('@')) {
      genres = genres.replace('@', '&');
    }
    query.genres = { $in: genres.split(',') };
  }
  if (year) {
    query.publishedDate = { $gte: new Date(year) };
  }

  Book.count(query).then(number => {
    let random = 0;
    if (number > 20) {
      random = Math.floor(Math.random() * (number - 20)) + 1;
    }
    Book.find(query)
      .limit(20)
      .skip(random)
      .then(books => res.json(books))
      .catch(next);
  });
};

module.exports.getSearchBooks = (req, res, next) => {
  Book.find(
    { $text: { $search: `\"${req.params.search}\"` } },
    { score: { $meta: 'textScore' } }
  )
    .limit(10)
    .sort({ score: { $meta: 'textScore' } })
    .then(books => {
      if (books && books.length > 0) {
        res.json(books);
      } else if (!req.params.search.length > 5) {
        res.json([]);
      } else {
        const query = req.params.search.toLowerCase();
        return booksService.findBooks(query).then(books => {
          books = books.filter(elem => elem.googlePrice).slice(0, 3);
          return Book.create(books).then(books => res.json(books));
        });
      }
    })
    .catch(next);
};

module.exports.getOneBook = (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        throw createError(404, 'Book not found');
      } else {
        res.json(book);
      }
    })
    .catch(next);
};

module.exports.getRegisterBooks = (req, res, next) => {
  let genre1 = { genres: { $in: 'Biography & Autobiography' } };
  let genre2 = { genres: { $in: 'Business & Economics' } };
  let genre3 = { genres: { $in: 'Fiction' } };
  let genre4 = { genres: { $in: 'Health & Fitness' } };
  let genre5 = { genres: { $in: 'Juvenile Fiction' } };
  let genre6 = { genres: { $in: 'History' } };
  let genre7 = { genres: { $in: 'Literary Collections' } };
  let genre8 = { genres: { $in: 'Performing Arts' } };
  let genre9 = { genres: { $in: 'Political Science' } };
  let genre10 = { genres: { $in: 'Self-Help' } };
  let genre11 = { genres: { $in: 'Social Science' } };
  let random = Math.floor(Math.random() * 3) + 1;
  Promise.all([
    Book.find(genre1)
      .limit(2)
      .skip(random),
    Book.find(genre2)
      .limit(2)
      .skip(random),
    Book.find(genre3)
      .limit(2)
      .skip(random),
    Book.find(genre4)
      .limit(2)
      .skip(random),
    Book.find(genre5)
      .limit(2)
      .skip(random),
    Book.find(genre6)
      .limit(2)
      .skip(random),
    Book.find(genre7)
      .limit(2)
      .skip(random),
    Book.find(genre8)
      .limit(2)
      .skip(random),
    Book.find(genre9)
      .limit(2)
      .skip(random),
    Book.find(genre10)
      .limit(2)
      .skip(random),
    Book.find(genre11)
      .limit(2)
      .skip(random)
  ])
    .then(books => {
      let newBooks = [];
      books.map(elem => elem.map(book => newBooks.push(book)));
      newBooks = newBooks
        .filter(
          elem =>
            elem.imageLink &&
            elem.imageLink !==
              'https://edition-medali.tn/img/p/fr-default-large_default.jpg'
        )
        .sort(() => 0.5 - Math.random());

      res.json(newBooks);
    })
    .catch(next);
};

module.exports.scanCover = (req, res, next) => {
  if (!req.file) {
    res.status(204).json(false);
  } else {
    const coverUrl = req.file.secure_url;
    visionService
      .getCoverInfo(coverUrl)
      .then(result => {
        const query = result.slice(0, 3).join(' ');
        Book.find(
          { $text: { $search: query } },
          { score: { $meta: 'textScore' } }
        )
          .limit(10)
          .sort({ score: { $meta: 'textScore' } })
          .then(books => {
            if (books && books.length > 0) {
              res.json(books);
            } else if (!req.params.search.length > 5) {
              res.json([]);
            } else {
              return booksService
                .findBooks(query)
                .then(books => {
                  books = books.filter(elem => elem.googlePrice).slice(0, 3);
                  return Book.create(books).then(books => res.json(books));
                })
                .catch(next);
            }
          })
          .catch(next);
      })
      .catch(next);
  }
};
