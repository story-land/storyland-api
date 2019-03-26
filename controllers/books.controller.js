const createError = require('http-errors');
const axios = require('axios');
const User = require('../models/user.model');
const Book = require('../models/book.model');

const hundredBooks = require('../100books.json');

module.exports.getBooks = (req, res, next) => {
  Book.find(req.query)
    .then(books => res.json(books))
    .catch(next);
};

module.exports.getOneBook = (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        throw createError(404, 'Book not found');
      } else {
        console.log(book);
        res.json(book);
      }
    })
    .catch(next);
};

// Script for adding books in the BDD
module.exports.createBook = (req, res, next) => {
  const books = hundredBooks;
  for (book of books) {
    const query = book[0].toLowerCase();
    axiosBook(query)
      .then(response => {
        const tenBooks = parseBookResponse(response.data);
        Book.findOne({ isbn: tenBooks[0].isbn })
          .then(book => {
            if (book) {
              throw createError(409, 'Book already created');
            } else {
              return new Book(tenBooks[0]).save();
            }
          })
          .then(book => res.status(201).json(book));
      })
      .catch(error => console.log(error));
  }
};

axiosBook = query => {
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

parseBookResponse = googleResponse => {
  const tenBooksArray = [];
  for (let i = 0; i < 10; i++) {
    const bookObj = {
      title: googleResponse.items[i].volumeInfo.title,
      authors:
        typeof googleResponse.items[i].volumeInfo.authors === Array
          ? [...googleResponse.items[i].volumeInfo.authors]
          : googleResponse.items[i].volumeInfo.authors,
      description: googleResponse.items[i].volumeInfo.description,
      genres: googleResponse.items[i].volumeInfo.categories,
      pageCount: googleResponse.items[i].volumeInfo.pageCount,
      publisher: googleResponse.items[i].volumeInfo.publisher,
      publishedDate: googleResponse.items[i].volumeInfo.publishedDate,
      isbn: googleResponse.items[i].volumeInfo.industryIdentifiers
        ? googleResponse.items[i].volumeInfo.industryIdentifiers[0].identifier
        : undefined,
      imageLink: googleResponse.items[i].volumeInfo.imageLinks
        ? googleResponse.items[i].volumeInfo.imageLinks.thumbnail
        : undefined,
      googleId: googleResponse.items[i].id,
      googlePrice: googleResponse.items[i].saleInfo.retailPrice
        ? googleResponse.items[i].saleInfo.retailPrice.amount
        : undefined,
      googleBuyLink: googleResponse.items[i].saleInfo.buyLink
        ? googleResponse.items[i].saleInfo.buyLink
        : undefined,
      pdfSampleLink: googleResponse.items[i].accessInfo.webReaderLink,
      googleRating: googleResponse.items[i].volumeInfo.averageRating
        ? googleResponse.items[i].volumeInfo.averageRating
        : undefined
    };
    let count = 0;
    for (prop in bookObj) {
      if (typeof prop === undefined) {
        count++;
      }
    }
    if (count < 4 || !bookObj.googleBuyLink) tenBooksArray.push(bookObj);
  }
  return tenBooksArray;
};
