'use strict';

import mongoose from 'mongoose';
import uuid from 'node-uuid';

/**
 * Generate a verification token using uuid v4.
 *
 * @returns {String} An uuid v4 token
 */
const generateToken = () => uuid.v4();

/**
 * Mongoose schema of verification token.
 *
 */
const verificationTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',
          required: '{PATH} is required', },
  token: { type: String, default: generateToken },
  createdAt: { type: Date, default: Date.now, expires: 12 * 60 * 60 },
});

mongoose.model('VerificationToken', verificationTokenSchema);
