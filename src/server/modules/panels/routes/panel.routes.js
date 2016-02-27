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

  app.route('/api/categories')
    .get(JWT_AUTH, permission.allowAll, categories.list)
    .post(JWT_AUTH, permission.allowAdmin, categories.create);

  app.route('/api/categories/:categoryId')
    .get(JWT_AUTH, permission.allowAll, categories.get)
    .put(JWT_AUTH, permission.allowAdmin, categories.update)
    .delete(JWT_AUTH, permission.allowAdmin, categories.delete)
    .post(JWT_AUTH, permission.allowAdmin, panels.create);

  app.route('/api/panels')
    .get(JWT_AUTH, permission.allowAll, panels.list);

  app.route('/api/panels/:panelId')
    .get(JWT_AUTH, permission.allowAll, panels.get)
    .put(JWT_AUTH, permission.allowAdmin, panels.update)
    .delete(JWT_AUTH, permission.allowAdmin, panels.delete)
    .post(JWT_AUTH, permission.allowAdmin, panels.create);

  app.param('panelId', panels.findPanelById);
  app.param('categoryId', categories.findCategoryById);
};
