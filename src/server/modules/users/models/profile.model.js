'use strict';

import mongoose from 'mongoose';
const genders = 'Neutrois Male Female Bigender None'.split(' ');

/**
 * Mongoose schema of user profile.
 *
 */
const profileSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: '{PATH} is required' },
  avatar: { type: String, default: null },
  banner: { type: String, default: null },
  tagline: { type: String, default: null },
  gender: { type: String, enum: genders, default: 'None' },
  dob: { type: Date },
  tokenLive: { type: String, default: '24h' },
  lastLogin: { type: Date, default: Date.now },
  lastOnline: { type: Date, default: Date.now },
});

/**
 * Generate a default avatar
 *
 * @param {String} username - Username
 * @returns {Object} The updated profile
 */
profileSchema.methods.generateAvatar = function (username) {
  const colors = ['5600FF', '0CDBE8', '5EFF00', 'E8A408', 'FF190D'];
  let size = 512;
  let meta = 'data:image/svg+xml;base64,';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" height="${size}" width="${size}">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#${colors[Math.floor(Math.random() * 5)]}"/>
              <text x="50%" y="50%" dy="180px" style="
                font-family: Arial Black;
                font-size: ${size}px;
                fill: white;"
              text-anchor="middle">${username[0].toUpperCase()}</text>
            </svg>`;
  this.avatar = meta + new Buffer(svg).toString('base64');
  return this.save();
};

/**
 * Update user's last online time.
 *
 * @returns {Object} The updated profile
 */
profileSchema.methods.online = function () {
  this.lastOnline = new Date();
  return this.save();
};

mongoose.model('Profile', profileSchema);
