'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of topic.
 *
 */
const topicSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: '{PATH} is required' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  date: { type: Date, default: Date.now },
  title: { type: String, required: '{PATH} is required' },
  updated: {
    by: { type: String, default: null },
    date: { type: Date, default: Date.now },
  },
  views: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  panel: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel' },
  lastReplies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  lastReplyDate: { type: Date, default: Date.now },
});

/**
 * Increment view number by one.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.view = function () {
  this.views += 1;
  return this.save();
};

/**
 * Increment reply number by one.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.reply = function () {
  this.replies += 1;
  return this.save();
};

/**
 * Increment upvote number by one.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.upvote = function () {
  this.upvotes += 1;
  return this.save();
};

/**
 * Increment downvote number by one.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.downvote = function () {
  this.downvotes += 1;
  return this.save();
};

mongoose.model('Topic', topicSchema);
