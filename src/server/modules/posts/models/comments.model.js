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
  likes: [{ type: String }],
});

/**
 * Stores the user's id who like this comment.
 *
 * @returns {Promise} The promise of this updated comment.
 */
commentSchema.methods.like = function (uid) {
  this.likes.push(uid);
  return this.save();
};

/**
 * Removes the user's id who un-like this comment.
 *
 * @returns {Promise} The promise of this updated comment.
 */
commentSchema.methods.unlike = function (uid) {
  this.likes.splice(this.likes.indexOf(uid), 1);
  return this.save();
};

mongoose.model('Comment', commentSchema);
