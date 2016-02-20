'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of panel.
 *
 */
const panelSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: '{PATH} is required' },
  order: { type: Number, default: 0 },
  description: { type: String },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Panel' }],
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel', default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  last: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  topics: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  logo: { type: String, default: null }
});

panelSchema.methods.addtopic = function(callback) {
    this.topics += 1;
    this.save(callback);
};

panelSchema.methods.addComments = function(callback) {
    this.comments += 1;
    this.save(callback);
};

mongoose.model('Panel', panelSchema);
