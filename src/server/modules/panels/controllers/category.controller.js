'use strict';

import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Category = mongoose.model('Category');
const Panel = mongoose.model('Panel');

/**
 * Controller that process category request.
 *
 * @author C Killua
 * @module Konko/Panels/Controllers/Category
 */
export default class CategoryController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Get a category then populates it, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get(req, res) {
    req.category.populate({
      path: 'panels',
      select: '_id name order description topics comments last',
      populate: {
        path: 'last',
        model: 'Topic',
        select: '_id title date author',
        populate: {
          path: 'author',
          model: 'User',
          select: '_id profile',
          populate: {
            path: 'profile',
            model: 'Profile',
            select: 'username avatar',
          },
        },
      },
      options: {
        sort: { order: -1 },
      },
    }, (err, category) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      res.json(category);
    });
  }

  /**
   * Query all categories then populates them, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list(req, res) {
    Category.find().lean().sort('-order')
      .populate({
        path: 'panels',
        select: '_id name order description last topics comments',
        populate: {
          path: 'last',
          model: 'Topic',
          select: '_id title date author',
          populate: {
            path: 'author',
            model: 'User',
            select: '_id profile',
            populate: {
              path: 'profile',
              model: 'Profile',
              select: 'username avatar',
            },
          },
        },
      }).exec()
      .then(categories => res.json(categories))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Create a category with values from request body.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create(req, res, next) {
    req.checkBody('name', 'Category name cannot be empty!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({ message: errors });
    }

    let user = req.payload;

    Category.create(req.body)
      .then(category => res.json(category))
      .catch(err => next(err));
  }

  /**
   * Update a category with values from request body, if has any.
   *
   * @param {Object} body - HTTP request body.
   * @param {Object} category - The requested category object.
   * @param {Object} user - The current user.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update({ body, category, payload: user }, res) {
    utils.partialUpdate(body, category, 'name', 'order');
    category.save()
      .then(category => res.json(category))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Delete a category and its panl then response back HTTP 200.
   *
   * @param {Object} body - HTTP request body.
   * @param {Object} category - The requested category object.
   * @param {Object} user - The current user.
   * @param {Object} res - HTTP response.
   * @static
   */
  static delete({ body, category, user }, res) {
    Panel.find({ category: category }).then(panels => {
      panels.forEach(panel => {
        panel.remove().catch(err => res.status(500).send({ message: err }));
      });
      category.remove()
        .then(() => res.status(200).send({ message: 'ok' }))
        .catch(err => res.status(500).send({ message: err }));
    }).catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Middleware, find a category with an ID, then embed into req.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
  static findCategoryById(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Category ID is invalid' });
    }

    Category.findById(id).exec()
      .then(category =>  (req.category = category) ? next() : res.status(404).send({ message: 'Category is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
