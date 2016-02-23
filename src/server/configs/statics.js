'use strict';

import express from 'express';
import glob from 'glob';
import path from 'path';

/**
 * Glob each pattern and push file path to output.
 *
 * @param {Array} files - Array of file path patterns.
 * @param {Object} options - Options that pass into glob.
 * @param {Array} output - Array of outputed file paths.
 * @param {String} prefix - Prefix that will strip from original file paths.
 */
const globFilePath = (files, options, output, prefix) => {
  files.forEach(file => {
    glob.sync(file, options).forEach(path => {
      output.push(path.replace(prefix + '/', ''));
    });
  });
};

/**
 * Configurate statics files and directories based on express environment.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Statics
 * @param {Object} app - Express app.
 * @param {Object} statics - Object that contains all static files and paths.
 * @param {Object} client - Object that contains all client side fileds/paths.
 */
export default (app, statics, client) => {
  app.locals.css = [statics.shared.libs.mincss.replace(statics.shared.root + '/', '')];
  app.locals.js = [statics.shared.libs.minjs.replace(statics.shared.root + '/', '')];

  if (app.get('env') === 'production') {
    app.use(express.static(path.join(app.pwd, statics.dist.static)));
    globFilePath(client.dist.css, {}, app.locals.css, statics.dist.static);
    globFilePath(client.dist.js, {}, app.locals.js, statics.dist.static);
  } else {
    app.use(express.static(path.join(app.pwd, statics.build.static)));
    globFilePath(client.build.css, {}, app.locals.css, statics.build.static);
    globFilePath(client.build.js, { nosort: true }, app.locals.js, statics.build.static);
  }

  app.use('/libs', express.static(path.join(app.pwd, statics.shared.libs.root)));
  app.use('/favicons', express.static(path.join(app.pwd, statics.shared.favicons.root)));
  app.use('/uploads', express.static(path.join(app.pwd, statics.shared.uploads.root)));
  app.use('/styles', express.static(path.join(app.pwd, statics.shared.styles.root)));
};
