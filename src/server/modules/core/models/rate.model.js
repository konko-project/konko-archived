'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of rate limit record.
 *
 */
const rateSchema = new mongoose.Schema({
  ip: { type: String, required: '{PATH} is required', trim: true, match: /^(\:\:ffff\:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/ },
  hits: { type: Number, default: 1, required: '{PATH} is required', min: 0, max: 600 },
  createdAt: { type: Date, default: Date.now, required: '{PATH} is required', expires: 10 * 60 },
});

mongoose.model('RateLimit', rateSchema);
