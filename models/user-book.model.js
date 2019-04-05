const mongoose = require('mongoose');

const UserBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    state: {
      type: String,
      enum: ['pending', 'read', 'reading']
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
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

UserBookSchema.index({ user: 1, book: 1 }, { unique: true });

const UserBook = mongoose.model('UserBook', UserBookSchema);

module.exports = UserBook;
