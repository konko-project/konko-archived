'use strict';

import path from 'path';
import multer from 'multer';

/**
 * Configurate multer for file uploading.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Multer
 * @param {Object} app - Express app.
 * @param {Function|String} dest - Destination where the uploaded file stores.
 * @param {Function} filename - A function that generates file name.
 * @param {Object} limits - A object that contains multer limits setting.
 * @param {Function} fileFilter - A function that doing file filtering.
 * @returns {Object} A multer object with presented settings.
 */
export default (app, dest, filename = null, limits = null, fileFilter = null) => {
  let storage = typeof dest === 'string' ? dest :
                typeof dest === 'function' && filename ? multer.diskStorage({
                  destination: dest,
                  filename: filename
                }) :
                typeof dest === 'function' ? multer.diskStorage({
                  destination: dest
                }) : require(path.join(app.pwd, 'configurations', 'statics')).uploads.root;

  return limits && fileFilter ? multer({ storage: storage, limits: limits, fileFilter: fileFilter }) :
         limits ? multer({ storage: storage, limits: limits }) :
         fileFilter ? multer({ storage: storage, fileFilter: fileFilter }) : multer({ storage: storage });
};
