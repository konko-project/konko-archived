'use strict';

import fs from 'fs';
import path from 'path';
import jwt from 'express-jwt';
import upload from '../controllers/upload.controller';

/**
 * Configs multer storage, create directories if not exist.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {multerCallback} cb - A callback for multer.
 */
const storage = (req, file, cb) => {
  const STATICS = require(path.join(req.app.pwd, 'configurations', 'statics'));
  const base = STATICS.shared.uploads.users;
  const user_dir = path.join(base, req.body.userId);
  const field_dir = path.join(user_dir, file.fieldname);
  if (!fs.existsSync(path.join(req.app.pwd, user_dir))) {
      fs.mkdirSync(path.join(req.app.pwd, user_dir));
  }
  if (!fs.existsSync(path.join(req.app.pwd, field_dir))) {
      fs.mkdirSync(path.join(req.app.pwd, field_dir));
  }
  cb(null, path.join(req.app.pwd, field_dir));
};

/**
 * Upload routing and multer configure.
 *
 * @author C Killua
 * @module Konko/Core/Routes/Upload
 * @param {Object} app - Express app.
 */
export default app => {
  const jwt_auth = jwt({secret: app.get('secret'), userProperty: 'payload'});
  const profileAUpload = new app.multer(app, storage, null, { fileSize: 2 * 1024 * 1024 });
  const profileBUpload = new app.multer(app, storage, null, { fileSize: 5 * 1024 * 1024 });

  app.route('/api/upload/avatar')
    .post(jwt_auth, profileAUpload.single('avatar'), upload.profileUpload);

  app.route('/api/upload/banner')
    .post(jwt_auth, profileBUpload.single('banner'), upload.profileUpload);
};

/**
 * Callback for multer.
 *
 * @callback multerCallback
 * @param {Null} null.
 * @param {String} Path that where the file will store.
 */
