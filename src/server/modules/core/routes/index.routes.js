'use strict';

import index from '../controllers/index.controller';

/**
 * Index routing.
 *
 * @author C Killua
 * @module Konko/Core/Routes/Index
 * @param {Object} app - Express app.
 */
export default app => {

  app.route('/:url(api|libs|javascripts|css|favicons)/*').get((req, res) => {
    res.status(404).json({
      messages: 'Not Found!',
    });
  });

  app.route('/setup').get(index.setup);
  app.route('/*').get(index.index);
};
