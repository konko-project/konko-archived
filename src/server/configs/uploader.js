'use strict';

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const Core = mongoose.model('Core');

/**
 * Configs multer storage, create directories if not exist.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} file - The file going to upload.
 * @param {multerCallback} cb - A callback for multer.
 */
const multerStorage = (req, file, cb) => {
  const STATICS = require(path.join(req.app.pwd, 'configurations', 'statics'));
  const BASE = STATICS.shared.uploads.users;
  const USER_DIR = path.join(BASE, req.body.userId);
  const FIELD_DIR = path.join(USER_DIR, file.fieldname);
  if (!fs.existsSync(path.join(req.app.pwd, USER_DIR))) {
    fs.mkdirSync(path.join(req.app.pwd, USER_DIR));
  }

  if (!fs.existsSync(path.join(req.app.pwd, FIELD_DIR))) {
    fs.mkdirSync(path.join(req.app.pwd, FIELD_DIR));
  }

  cb(null, path.join(req.app.pwd, FIELD_DIR));
};

/**
 * Configs multer filter, check file mimetype.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} file - The file going to upload.
 * @param {multerCallback} cb - A callback for multer.
 */
const Filter = (req, file, cb) => {
  if (!file.mimetype.match(/image\/.*/)) {
    cb(new Error('Only images are allowed'));
  }
  cb(null, true);
};

/**
 * Konko file uploader.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Uploader
 */
export default class Uploader {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Return the promise of the Core
   *
   * @returns {Promise} Core promise
   */
  static getLimit() {
    return new Promise((resolve, reject) => Core.findOne().then(({ profile }) => resolve(profile)).catch(err => reject(err))).then(profile => profile);
  }

  /**
   * Single uploader that handler user's profile image uploading
   *
   * @param {Object} app - Express app
   * @param {String} field - A string represents what to upload
   * @returns {Function} A middleware
   */
  static upload(app, field) {
    return (req, res, next) => {
      Uploader.getLimit().then(profile => {
        let multer = new app.multer(app, multerStorage, null, { fileSize: profile[field].limit * 1024 }, Filter);
        multer.single(field)(req, res, err => {
          return err ? res.status(500).sjson({ message: err.toString() }) : next();
        });
      }).catch(err => res.status(500).sjson({ message: err }));
    };
  }

}

/**
 * Callback for multer.
 *
 * @callback multerCallback
 * @param {Null} null.
 * @param {String} Path that where the file will store.
 */
