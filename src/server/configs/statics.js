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
 * @param {Object} client - Object that contains all client side fileds and paths.
 */
export default (app, statics, client) => {
  app.locals.css = [path.join(statics.shared.libs.root, '*.min.css')];
  app.locals.js = [path.join(statics.shared.libs.root, '*.min.js')];

  if (app.get('env') === 'development') {
    app.use(express.static(path.join(app.pwd, statics.build.static)));
    globFilePath(client.build.css, {}, app.locals.css, statics.build.root);
    globFilePath(client.build.js, {nosort: true}, app.locals.js, statics.build.root);
  } else if (app.get('env') === 'production') {
    app.use(express.static(path.join(app.pwd, statics.dist.static)));
    globFilePath(client.dist.css, {}, app.locals.css, statics.dist.root);
    globFilePath(client.dist.js, {}, app.locals.js, statics.dist.root);
  } else {
    // Do something later
  }
  
  app.use('/libs', express.static(path.join(app.pwd, statics.shared.libs.root)));
  app.use('/favicons', express.static(path.join(app.pwd, statics.shared.favicons.root)));
  app.use('/uploads', express.static(path.join(app.pwd, statics.shared.uploads.root)));
  app.use('/styles', express.static(path.join(app.pwd, statics.shared.styles.root)));
};
