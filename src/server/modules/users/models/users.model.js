'use strict';

import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const permissions = 'admin user banned guest'.split(' ');

/**
 * Mongoose schema of user.
 *
 */
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, required: '{PATH} is required' },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  preference: { type: mongoose.Schema.Types.ObjectId, ref: 'Preference' },
  hash: { type: String },
  salt: { type: String },
  joined: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  permission: { type: String, enum: permissions, default: 'user' },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
});

/**
 * Generate user password using salt and pbkdf2 for storage.
 *
 * @param {String} password - Orginial password.
 */
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

/**
 * Validate a user password by hashing and compare the one is stored.
 *
 * @param {String} password - Orginial password.
 * @returns {Boolean} True if password hash is same as the one stored.
 */
userSchema.methods.validPassword = function (password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

/**
 * Simply update user's last login time.
 *
 * @returns {Promise} Updated user.
 */
userSchema.methods.login = function () {
  this.profile.lastLogin = Date.now();
  return this.save();
};

/**
 * Transfer a user's doc into a JWT.
 *
 * @param {Object} app - Express app.
 * @returns {String} JWT.
 */
userSchema.methods.generateJWT = function (app) {
  return jwt.sign({
    _id: this._id,
    joined: this.joined,
    permission: this.permission,
    verified: this.verified,
    profile: this.profile,
    preference: this.preference,
  }, app.get('secret'), {
    expiresIn: this.profile.tokenLive,
  });
};

mongoose.model('User', userSchema);
