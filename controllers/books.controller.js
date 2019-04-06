const createError = require('http-errors');
const booksService = require('../services/books.service');
const axios = require('axios');
const User = require('../models/user.model');
const Book = require('../models/book.model');

const hundredBooks = require('../100books.json');

module.exports.getBooks = (req, res, next) => {
  const { genres, rating, year } = req.query;
  const query = {};
  if (rating) {
    query.googleRating = { $gte: rating };
  }
  if (genres) {
    query.genres = { $in: genres.split(',') };
  }
  if (year) {
    query.publishedDate = { $gte: new Date(year) };
  }

  Book.find(query)
    .then(books => res.json(books))
    .catch(next);
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

// Script for adding books in the BDD
module.exports.createBook = (req, res, next) => {
  const books = hundredBooks;
  for (book of books) {
    const query = book.toLowerCase();
    axiosBook(query).then(response => {
      const oneBook = parseBookResponse(response.data.items[0]);
      Book.findOne({ isbn: oneBook.isbn })
        .then(book => {
          if (book) {
            throw createError(409, 'Book already created');
          } else {
            return new Book(oneBook).save();
          }
        })
        .then(book => res.status(201).json(book));
    });
  }
};

axiosBook = async function(query) {
  return Promise.resolve(
    axios.get('https://www.googleapis.com/books/v1/volumes', {
      headers: {
        key: process.env.GBOOKS_API_KEY
      },
      params: {
        q: query
      }
    })
  );
};

parseBookResponse = googleBook => {
  return {
    title: googleBook.volumeInfo.title,
    authors:
      typeof googleBook.volumeInfo.authors === Array
        ? [...googleBook.volumeInfo.authors]
        : googleBook.volumeInfo.authors,
    description: googleBook.volumeInfo.description,
    genres: googleBook.volumeInfo.categories,
    pageCount: googleBook.volumeInfo.pageCount,
    publisher: googleBook.volumeInfo.publisher,
    publishedDate: googleBook.volumeInfo.publishedDate,
    isbn: googleBook.volumeInfo.industryIdentifiers
      ? googleBook.volumeInfo.industryIdentifiers[0].identifier
      : undefined,
    imageLink: googleBook.volumeInfo.imageLinks
      ? googleBook.volumeInfo.imageLinks.thumbnail
      : 'https://edition-medali.tn/img/p/fr-default-large_default.jpg',
    googleId: googleBook.id,
    googlePrice: googleBook.saleInfo.retailPrice
      ? googleBook.saleInfo.retailPrice.amount
      : undefined,
    googleBuyLink: googleBook.saleInfo.buyLink
      ? googleBook.saleInfo.buyLink
      : undefined,
    pdfSampleLink: googleBook.accessInfo.webReaderLink,
    googleRating: googleBook.volumeInfo.averageRating
      ? googleBook.volumeInfo.averageRating
      : undefined
  };
};
