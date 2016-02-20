'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of category.
 *
 */
const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: '{PATH} is required' },
  panels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Panel' }],
  order: { type: Number, default: 0 }
});

mongoose.model('Category', categorySchema);
