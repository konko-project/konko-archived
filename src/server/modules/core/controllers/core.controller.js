'use strict';

import mongoose from 'mongoose';
const Core = mongoose.model('Core');

/**
 * Controller that process panel request.
 *
 * @author C Killua
 * @module Konko/Core/Controllers/Core
 */
export default class CoreController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Response a basic Core info as JSON
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static get(req, res, next) {
    Core.findOne()
      .then(core => res.status(200).json(core))
      .catch(err => next(err));
  }

  /**
   * Response a full Core setting as JSON
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static basic(req, res, next) {
    Core.findOne()
      .select('title')
      .then(core => res.status(200).json(core))
      .catch(err => next(err));
  }

  /**
   * Create a Core setting if does not exist one
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create(req, res, next) {
    Core.find().then(cores => {
      if (cores && cores.length) {
        res.status(400).json({ message: 'Bad Request!' });
      } else {
        req.checkBody('basic.title', 'Title cannot be empty!').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
          return res.status(400).json({ message: errors });
        }
        Core.create(req.body)
          .then(core => res.status(201).json(core))
          .catch(err => next(err));
      }
    }).catch(err => next(err));
  }

  static update(req, res) {

  }

}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
