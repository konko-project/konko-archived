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

  app.route('/:url(api|modules|lib)/*').get((req, res) => {
    res.status(404).json({
      messages: 'Not Found!',
    });
  });

  app.route('/*').get(index.index);
};
