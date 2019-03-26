const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    authors: {
      type: Array,
      required: [true, 'Author is required']
    },
    description: {
      type: String
    },
    genres: {
      type: Array
    },
    pageCount: {
      type: Number
    },
    publisher: {
      type: String
    },
    publishedDate: {
      type: Date
    },
    isbn: {
      type: Number,
      unique: true
    },
    imageLink: {
      type: String
    },
    googleId: {
      type: String
    },
    googlePrice: {
      type: Number
    },
    googleBuyLink: {
      type: String
    },
    pdfSampleLink: {
      type: String
    },
    googleRating: {
      type: Number
    }
  },
  {
    timestamps: true,
    toJSON: {
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

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
