'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of carousel slide.
 *
 */
const slideSchema = new mongoose.Schema({
  title: { type: String, required: '{PATH} is required' },
  description: { type: String, default: null },
  image: { type: String, required: '{PATH} is required' },
  url: { type: String, required: '{PATH} is required' },
  alt: { type: String, default: 'konko carousel slide' },
  order: { type: Number, default: 0 },
});

mongoose.model('Slide', slideSchema);
