'use strict';

import jwt from 'express-jwt';
import core from '../controllers/core.controller';
import permission from '../../../configs/permission';

/**
 * Core routing.
 *
 * @author C Killua
 * @module Konko/Core/Routes/Core
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/core')
    .get(core.basic)
    .post(core.create);

  app.route('/api/v1/core/:coreId')
    .get(JWT_AUTH, permission.get('allowAdmin'), core.get)
    .put(JWT_AUTH, permission.get('allowAdmin'), core.update);
};
