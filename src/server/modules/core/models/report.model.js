'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of inappropriate report.
 *
 */
const reportSchema = new mongoose.Schema({
  iid: { type: String, required: '{PATH} is required' },
  type: { type: String, required: '{PATH} is required' },
  url: { type: String, required: '{PATH} is required' },
  reason: { type: String, required: '{PATH} is required' },
  createAt: { type: Date, default: Date.now },
  done: { type: Boolean, default: false },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

/**
 * Set Report to be done when processed.
 *
 * @returns {Promise} The promise of this updated report.
 */
reportSchema.methods.processed = function () {
  this.done = true;
  return this.save();
};

mongoose.model('Report', reportSchema);
