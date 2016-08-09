'use strict';

import mongoose from 'mongoose';
const Core = mongoose.model('Core');

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
    Core.find().then(cores => {
      if (cores && cores.length) {
        let core = cores[0];
        res.render('index', {
          title: core.basic.title,
          description: core.basic.description,
          keywords: core.basic.keywords,
          logo: core.basic.logo,
          since: core.basic.since,
          protocol: req.protocol,
          host: req.get('host'),
        });
      } else {
        res.redirect('/setup');
      }
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  static setup(req, res) {
    Core.find().then(cores => {
      if (cores && cores.length) {
        res.redirect('/');
      } else {
        res.render('setup', {
          title: 'Setup - Konko Project',
          description: 'Setting up new Konko',
          protocol: req.protocol,
          host: req.get('host'),
        });
      }
    }).catch(err => res.status(500).sjson({ message: err }));
  }
}
