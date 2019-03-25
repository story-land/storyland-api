const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    pagesDay: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
        return ret;
      }
    }
  }
);

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
