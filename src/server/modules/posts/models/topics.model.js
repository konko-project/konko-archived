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
  title: { type: String, required: '{PATH} is required'},
  updated: {
    by: { type: String, default: null },
    date: { type: Date, default: Date.now },
  },
  views: { type: Number, default: 0 },
  panel: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel' },
  lastReplyDate: { type: Date, default: Date.now },
  likes: [{ type: String }],
  bookmarks: [{ type: String }],
});

topicSchema.index({ title: 'text', content: 'text' });

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
 * Stores the user's id who like this topic.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.like = function (uid) {
  this.likes.push(uid);
  return this.save();
};

/**
 * Removes the user's id who un-like this topic.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.unlike = function (uid) {
  this.likes.splice(this.likes.indexOf(uid), 1);
  return this.save();
};

/**
 * Stores the user's id who bookmark this topic.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.bookmark = function (uid) {
  this.bookmarks.push(uid);
  return this.save();
};

/**
 * Removes the user's id who un-bookmark this topic.
 *
 * @returns {Promise} The promise of this updated topic.
 */
topicSchema.methods.unbookmark = function (uid) {
  this.bookmarks.splice(this.bookmarks.indexOf(uid), 1);
  return this.save();
};

mongoose.model('Topic', topicSchema);
