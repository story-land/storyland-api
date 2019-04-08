const mongoose = require('mongoose');

const SocialSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

SocialSchema.index({ follower: 1, followed: 1 }, { unique: true });

const Social = mongoose.model('Social', SocialSchema);

module.exports = Social;
