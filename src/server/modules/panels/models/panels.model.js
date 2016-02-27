'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of panel.
 *
 */
const panelSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: '{PATH} is required' },
  order: { type: Number, min: 0, default: 0 },
  description: { type: String },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Panel' }],
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel', default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  last: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  topics: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  logo: { type: String, default: null },
});

/**
 * Increment topic number by one.
 *
 * @returns {Promise} The promise of this updated panel.
 */
panelSchema.methods.addtopic = function () {
  this.topics += 1;
  return this.save();
};

/**
 * Increment comment number by one.
 *
 * @returns {Promise} The promise of this updated panel.
 */
panelSchema.methods.addComment = function () {
  this.comments += 1;
  return this.save();
};

mongoose.model('Panel', panelSchema);
