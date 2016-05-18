'use strict';

import jwt from 'express-jwt';
import auth from '../controllers/auth.controller';
import utils from '../../../configs/utils';

/**
 * Auth routing.
 *
 * @author C Killua
 * @module Konko/Users/Routes/Authentication
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/auth/register')
    .post(auth.register(app));

  app.route('/api/v1/auth/login')
    .post(auth.login(app));

  app.route('/api/v1/auth/logout')
    .get(auth.getGuest(app));

  app.route('/api/v1/auth/sync')
    .get(JWT_AUTH, auth.sync(app));

  app.route('/api/v1/verify/:token')
    .get(auth.verify);

  app.route('/api/v1/auth/reset')
    .post(utils.throttle, auth.resetPass(app));

  app.param('token', auth.findToken);
};
