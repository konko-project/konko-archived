'use strict';

import jwt from 'express-jwt';
import user from '../controllers/user.controller';

/**
 * Profile routing.
 *
 * @author C Killua
 * @module Konko/Users/Routes/Profile
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/users/:userId')
    .get(user.get)
    .put(JWT_AUTH, user.updateProfile);

  app.param('userId', user.findUserById);
};
