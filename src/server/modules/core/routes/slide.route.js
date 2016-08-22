'use strict';

import jwt from 'express-jwt';
import slide from '../controllers/slide.controller';
import permission from '../../../configs/permission';

/**
 * Slide routing.
 *
 * @author C Killua
 * @module Konko/Core/Routes/Slide
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/slides')
    .get(JWT_AUTH, permission.get('allowAll'), slide.list)
    .post(JWT_AUTH, permission.get('allowAdmin'), slide.create);

  app.route('/api/v1/slides/:slideId')
    .get(JWT_AUTH, permission.get('allowAll'), slide.get)
    .put(JWT_AUTH, permission.get('allowAdmin'), slide.update)
    .delete(JWT_AUTH, permission.get('allowAdmin'), slide.delete);

  app.param('slideId', slide.findSlideById);
};
