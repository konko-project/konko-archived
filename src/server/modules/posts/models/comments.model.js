'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of comment.
 *
 */
const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: '{PATH} is required' },
  short: { type: String },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  date: { type: Date, default: Date.now },
  updated: {
    by: { type: String, default: null },
    date: { type: Date, default: Date.now },
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
});

/**
 * Increment upvote number by one.
 *
 * @returns {Promise} The promise of this updated comment.
 */
commentSchema.methods.upvote = function () {
  this.upvotes += 1;
  return this.save();
};

/**
 * Increment downvote number by one.
 *
 * @returns {Promise} The promise of this updated comment.
 */
commentSchema.methods.downvote = function () {
  this.downvotes += 1;
  return this.save();
};

mongoose.model('Comment', commentSchema);
