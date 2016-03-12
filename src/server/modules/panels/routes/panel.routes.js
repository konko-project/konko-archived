'use strict';

import jwt from 'express-jwt';
import panels from '../controllers/panel.controller';
import categories from '../controllers/category.controller';
import permission from '../../../configs/permission';

/**
 * Panel routing.
 *
 * @author C Killua
 * @module Konko/Panels/Routes/Panel
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/categories')
    .get(JWT_AUTH, permission.get('allowAll'), categories.list)
    .post(JWT_AUTH, permission.get('allowAdmin'), categories.create);

  app.route('/api/v1/categories/:categoryId')
    .get(JWT_AUTH, permission.get('allowAll'), categories.get)
    .put(JWT_AUTH, permission.get('allowAdmin'), categories.update)
    .delete(JWT_AUTH, permission.get('allowAdmin'), categories.delete);

  app.route('/api/v1/categories/:categoryId/panels')
    .get(JWT_AUTH, permission.get('allowAll'), panels.list)
    .post(JWT_AUTH, permission.get('allowAdmin'), panels.create);

  app.route('/api/v1/categories/:categoryId/panels/:panelId')
    .get(JWT_AUTH, permission.get('allowAll'), panels.get)
    .post(JWT_AUTH, permission.get('allowAdmin'), panels.create)
    .put(JWT_AUTH, permission.get('allowAdmin'), panels.update)
    .delete(JWT_AUTH, permission.get('allowAdmin'), panels.delete);

  app.param('panelId', panels.findPanelById);
  app.param('categoryId', categories.findCategoryById);
};
