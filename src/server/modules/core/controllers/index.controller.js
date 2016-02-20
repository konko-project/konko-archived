'use strict';

/**
 * Controller that process index request.
 *
 * @author C Killua
 * @module Konko/Core/Controllers/Index
 */
export default class IndexController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Render index page along with providing values.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   */
  static index(req, res) {
    res.render('index', {
      title: 'Konko Project',
      description: 'MEAN stack based forum',
      protocol: req.protocol,
      host: req.get('host'),
    });
  }
}
