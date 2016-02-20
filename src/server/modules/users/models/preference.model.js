'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of user preference settings.
 *
 */
const preferenceSchema = new mongoose.Schema({
  topicListLimit: { type: Number, default: 20 },
  commentListLimit: { type: Number, default: 30 },
});

mongoose.model('Preference', preferenceSchema);
