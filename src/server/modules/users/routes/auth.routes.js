'use strict';

import jwt from 'express-jwt';
import auth from '../controllers/auth.controller';

/**
 * Auth routing.
 *
 * @author C Killua
 * @module Konko/Users/Routes/Authentication
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/auth/register')
    .post(auth.register(app));

  app.route('/api/auth/login')
    .post(auth.login(app));

  app.route('/api/auth/sync')
    .get(JWT_AUTH, auth.sync(app));

  app.route('/api/verify/:token')
    .get(auth.verify);

  app.param('token', auth.findToken);
};
