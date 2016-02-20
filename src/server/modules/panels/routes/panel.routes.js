'use strict';

import jwt from 'express-jwt';
import panels from '../controllers/panel.controller';
import categories from '../controllers/category.controller';

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
    .get(categories.list)
    .post(JWT_AUTH, categories.create);

  app.route('/api/categories/:categoryId')
    .get(categories.get)
    .put(JWT_AUTH, categories.update)
    .delete(JWT_AUTH, categories.delete)   // TODO: Destructing Category
    .post(JWT_AUTH, panels.create);   // create sub-panel

  app.route('/api/panels')
    .get(panels.list);

  app.route('/api/panels/:panelId')
    .get(panels.get)
    .put(JWT_AUTH, panels.update)
    .delete(JWT_AUTH, panels.delete)       // TODO: Destructing Panel
    .post(JWT_AUTH, panels.create);   // create sub-panel

  app.param('panelId', panels.findPanelById);
  app.param('categoryId', categories.findCategoryById);
};
