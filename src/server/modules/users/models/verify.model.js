'use strict';

import mongoose from 'mongoose';
import uuid from 'node-uuid';

/**
 * Mongoose schema of verification token.
 *
 */
const verificationTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',
          required: '{PATH} is required', },
  token: { type: String, required: '{PATH} is required' },
  expiresAt: { type: Date, default: Date.now, expires: 12 * 3600 },
});

/**
 * Generate a verification token using uuid v4.
 *
 * @param {Verify~doneCallback} done - A callback to run.
 * @returns {Verify~doneCallback} Callback
 */
verificationTokenSchema.methods.generateToken = function (done) {
  const _this = this;
  const newToken = _this;
  newToken.token = uuid.v4();
  newToken.save(err => {
    if (err) {
      return done(err);
    }

    return done(null, newToken.token);
  });
};

mongoose.model('VerificationToken', verificationTokenSchema);

/**
 * Callback that handles the generated token.
 *
 * @callback Verify~doneCallback
 * @param {Null} null - null
 * @param {String} token - A uuid v4 token.
 */
