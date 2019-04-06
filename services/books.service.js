const axios = require('axios');

const http = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1',
  headers: {
    key: process.env.GBOOKS_API_KEY
  }
});

module.exports.findBooks = query => {
  return http
    .get('/volumes', {
      params: {
        q: query
      }
    })
    .then(({ data }) => {
      data = data.items.slice(0, 4);
      return data
        .map(i => parseBookResponse(i))
        .filter(elem => elem !== undefined);
    });
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
