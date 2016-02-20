'use strict';

import mongoose from 'mongoose';
const genders = 'Neutrois Male Female Bigender None'.split(' ');

/**
 * Mongoose schema of user profile.
 *
 */
const profileSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: '{PATH} is required' },
  avatar: { type: String, default: 'images/users/default.png' },
  banner: { type: String, default: null },
  gender: { type: String, enum: genders, default: 'None' },
  dob: { type: Date },
  tokenLive: { type: String, default: '24h' },
  lastLogin: { type: Date, default: Date.now },
});

mongoose.model('Profile', profileSchema);
