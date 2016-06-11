'use strict';

import jwt from 'express-jwt';
import Uploader from '../../../configs/uploader';
import upload from '../controllers/upload.controller';
import permission from '../../../configs/permission';

/**
 * Upload routing and multer configure.
 *
 * @author C Killua
 * @module Konko/Core/Routes/Upload
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/upload/avatar')
    .post(JWT_AUTH, permission.get('allowUser'), Uploader.upload(app, 'avatar'), upload.profileUpload);

  app.route('/api/v1/upload/banner')
    .post(JWT_AUTH, permission.get('allowUser'), Uploader.upload(app, 'banner'), upload.profileUpload);
};
