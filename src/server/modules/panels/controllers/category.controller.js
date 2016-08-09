'use strict';

import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Category = mongoose.model('Category');
const Panel = mongoose.model('Panel');
const Core = mongoose.model('Core');

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
   * Update Category Schema so that it meets the limit config from Core settings.
   *
   * @param {Object} res - HTTP response.
   * @returns {Response} Response 500 if error exist.
   */
  static updateSchema(res) {
    Core.find().then(cores => {
      let { panel: { category: { name: { min, max } } } } = cores[0];
      Category.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: min,
        maxlength: max,
      });
    }).catch(err => {
      res.status(500).sjson({ message: err });
    });
  }

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
      select: '_id name order description topics comments last logo',
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
        return res.status(500).sjson({ message: err });
      }

      res.status(200).sjson(category);
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
    Category.find().select(req._fields).sort(req._sort).lean()
      .populate({
        path: 'panels',
        select: '_id name order description last topics comments logo',
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
      .then(categories => res.status(200).sjson(categories))
      .catch(err => res.status(500).sjson({ message: err }));
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
    CategoryController.updateSchema(res);
    req.checkBody('name', 'Category name cannot be empty!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      return res.status(400).sjson({ message: errors });
    }
    Category.create(req.body)
      .then(category => res.status(201).sjson(category))
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
  static update({ checkBody, validationErrors, body, category }, res) {
    CategoryController.updateSchema(res);
    checkBody('name', 'Category name cannot be empty!').notEmpty();
    let errors = validationErrors();
    if (errors) {
      return res.status(400).sjson({ message: errors });
    }
    utils.partialUpdate(body, category, 'name', 'order');
    category.save()
      .then(category => res.status(200).sjson(category))
      .catch(err => res.status(500).sjson({ message: err }));
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
    Panel.remove({ category: category }).then(() => {
      category.remove()
        .then(() => res.status(200).sjson({ message: `${category.name} has been removed.` }))
        .catch(err => res.status(500).sjson({ message: err }));
    }).catch(err => res.status(500).sjson({ message: err }));
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
      return res.status(400).sjson({ message: 'Category ID is invalid' });
    }
    Category.findById(id).select(req._fields).sort(req._sort).exec()
      .then(category => (req.category = category) ? next() : res.status(404).sjson({ message: 'Category is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
