'use strict';

import mongoose from 'mongoose';

/**
 * Mongoose schema of Konko core.
 *
 */
const coreSchema = new mongoose.Schema({
  basic: {
    title: { type: String, unique: true, required: '{PATH} is required', default: 'Konko' },
    description: { type: String, unique: true, default: 'MEAN stack based forum.' },
    keywords: { type: String, unique: true, default: 'Konko,Konko Project' },
    logo: { type: String, default: 'styles/core/images/brand.png' },
    since: { type: Date, default: Date.now },
    public: { type: Boolean, default: true },
  },
  admin: {
    email: { type: String, unique: true, lowercase: true },
  },
  global: {
    installed: { type: Boolean, default: true },
    language: { type: String, lowercase: true, default: 'en-us' },
    navbar: {
      navs: [
        {
          name: { type: String, required: '{PATH} is required' },
          url: { type: String, required: '{PATH} is required' },
          order: { type: Number, min: 0 },
        }
      ],
    },
    styles: [
      {
        name: { type: String, unique: true, required: '{PATH} is required' },
        root: { type: String, unique: true, required: '{PATH} is required' },
      },
    ],
  },
  mailer: {
    method: { type: String, enum: ['sendmail', 'smtp', 'ses'],  default: 'sendmail' },
    from: { type: String, unique: true, lowercase: true, default: 'noreply@konko.project' },
    host: { type: String, unique: true },
    secure: { type: Boolean, default: true },
    port: { type: Number, default: 465 },
    user: { type: String, unique: true },
    password: { type: String, unique: true },
    ses_keyId: { type: String, unique: true },
    ses_secret: { type: String, unique: true },
  },
  registration: {
    public: { type: Boolean, default: true },
    message: { type: String, default: 'Registration is closed by admin.' },
    email: {
      verification: { type: Boolean, default: false },
      verificationSubject: { type: String, default: 'Welcome!' },
      ttl: { type: Number, default: 12 * 60 },
      welcome: { type: Boolean, default: false },
      welcomeMessage: { type: String },
    },
    password: {
      resetEmailSubject: { type: String, default: 'Reset your password' },
      regex: { type: String, default: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\@\\#\\$\\%\\^\\&\\*\\_\\ ]).{8,32}' },
      title: { type: String, default: 'Must contains 8 to 32 characters, including at least 1 digit, 1 lower case letter, 1 upper case letter, and 1 of the following special characters. (!, @, #, $, %, ^, &, *, _, )' },
      min: { type: Number, default: 8 },
      max: { type: Number, default: 32 },
      capital: { type: Boolean, default: true },
      lower: { type: Boolean, default: true },
      digit: { type: Boolean, default: true },
      special: { type: Boolean, default: true },
    },
    blacklist: [{ type: String, lowercase: true }],
  },
  profile: {
    username: {
      min: { type: Number, min: 1, default: 3 },
      max: { type: Number, min: 1, default: 12 },
      forbidden: [{ type: String }],
    },
    avatar: {
      upload: { type: Boolean, default: true },
      limit: { type: Number, default: 2046 },
    },
    banner: {
      upload: { type: Boolean, default: true },
      limit: { type: Number, default: 4096 },
    },
    tagline: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 1, default: 20 },
    },
  },
  panel: {
    panel: {
      name: {
        min: { type: Number, min: 0, default: 1 },
        max: { type: Number, min: 0, default: 60 },
      },
      description: {
        min: { type: Number, min: 0, default: 0 },
        max: { type: Number, min: 0, default: 200 },
      },
    },
    category: {
      name: {
        min: { type: Number, min: 0, default: 1 },
        max: { type: Number, min: 0, default: 60 },
      },
    },
  },
  post: {
    topic: {
      title: {
        min: { type: Number, min: 0, default: 5 },
        max: { type: Number, min: 0, default: 120 },
      },
      content: {
        min: { type: Number, min: 0, default: 10 },
        max: { type: Number, min: 0, default: 10000 },
      },
      lastReplyLength: { type: Number, min: 0, default: 3 },
    },
    comment: {
      content: {
        min: { type: Number, min: 0, default: 10 },
        max: { type: Number, min: 0, default: 10000 },
      },
      short: {
        max: { type: Number, min: 0, default: 15 },
      },
    },
  },
});

mongoose.model('Core', coreSchema);
