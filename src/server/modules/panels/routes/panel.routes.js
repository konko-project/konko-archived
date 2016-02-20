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
  const jwt_auth = jwt({secret: app.get('secret'), userProperty: 'payload'});

  app.route('/api/categories')
    .get(categories.list)
    .post(jwt_auth, categories.create);

  app.route('/api/categories/:categoryId')
    .get(categories.get)
    .put(jwt_auth, categories.update)
    .delete(jwt_auth, categories.delete)   // TODO: Destructing Category
    .post(jwt_auth, panels.create);   // create sub-panel

  app.route('/api/panels')
    .get(panels.list);

  app.route('/api/panels/:panelId')
    .get(panels.get)
    .put(jwt_auth, panels.update)
    .delete(jwt_auth, panels.delete)       // TODO: Destructing Panel
    .post(jwt_auth, panels.create);   // create sub-panel

  app.param('panelId', panels.findPanelById);
  app.param('categoryId', categories.findCategoryById);
};
