'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Panel = mongoose.model('Panel');
const Category = mongoose.model('Category');
const Core = mongoose.model('Core');

/**
 * Controller that process panel request.
 *
 * @author C Killua
 * @module Konko/Panels/Controllers/Panel
 */
export default class PanelController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Update Panel Schema so that it meets the limit config from Core settings.
   *
   * @param {Object} res - HTTP response.
   * @returns {Response} Response 500 if error exist.
   */
  static updateSchema(res) {
    Core.find().then(cores => {
      let { panel: { panel: { name, description } } } = cores[0];
      Panel.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: name.min,
        maxlength: name.max,
      });
      Panel.schema.path('description', {
        type: String,
        minlength: description.min,
        maxlength: description.max,
      });
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Get a panel then populates it, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get({ panel }, res) {
    panel.populate('parent', '_id name')
      .populate({
        path: 'children',
        select: '_id name description order topics comments logo last',
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
      }, (err, panel) => {
        if (err) {
          return res.status(500).sjson({ message: err });
        }
        res.status(200).sjson(panel);
      });
  }

  /**
   * Query all panels or panels in a category then populates them, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list(req, res) {
    let cate = req.category ? { category: req.category } : {};
    Panel.find(cate).select(req._fields).sort(req._sort).lean()
      .populate({
        path: 'children',
        select: '_id name',
        options: { sort: { order: -1 } },
      }).exec()
      .then(panels => res.status(200).sjson(panels))
      .catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Create a panel with values from request body.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create(req, res, next) {
    PanelController.updateSchema(res);
    req.checkBody('name', 'Panel name cannot be empty!').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).sjson({ message: errors });
    }
    Panel.create(req.body).then(panel => {
      if (req.panel) {
        panel.parent = req.panel;
        panel.category = req.category;
        panel.save().then(panel => {
          req.panel.children.push(panel);
          req.panel.save()
            .then(_panel => res.status(201).sjson(panel))
            .catch(err => next(err));
        }).catch(err => next(err));
      } else if (req.category) {
        panel.category = req.category;
        panel.save().then(panel => {
          req.category.panels.push(panel);
          req.category.save()
            .then(category => res.status(201).sjson(panel))
            .catch(err => next(err));
        }).catch(err => next(err));
      } else {
        res.status(400).sjson({ message: 'Missing Category or Parent' });
      }
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Update a panel with values from request body, if has any.
   *
   * @param {Function} checkBody - Function that checks the request body.
   * @param {Function} validationErrors - Function that returns the error from the validation.
   * @param {Object} body - HTTP request body.
   * @param {Object} panel - The requested panel object.
   * @param {Object} category - The category where the panel is in.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update({ checkBody, validationErrors, body, panel, category }, res) {
    PanelController.updateSchema(res);
    checkBody('name', 'Panel name cannot be empty!').notEmpty();
    var errors = validationErrors();
    if (errors) {
      return res.status(400).sjson({ message: errors });
    }
    utils.partialUpdate(body, panel, 'name', 'order', 'description', 'logo');
    panel.save()
      .then(panel => res.status(200).sjson(panel))
      .catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Delete a panel and its children then response back HTTP 200.
   *
   * @param {Object} body - HTTP request body.
   * @param {Object} panel - The requested panel object.
   * @param {Object} user - The current user.
   * @static
   */
  static delete({ body, category, panel, user }, res) {
    let panels = [panel];
    const cb = p => {
      panels.push(p);
    };
    const errorCB = err => {
      return res.status(500).sjson({ message: err });
    };
    while (panels.length) {
      let _panel = panels.shift();
      for (let child of _panel.children) {
        Panel.findOne(child).then(cb).catch(errorCB);
      }
      _panel.remove().catch(errorCB);
    }
    category.panels.remove(panel);
    category.save()
      .then(cate => res.status(200).sjson({ message: `${panel.name} and its children have been removed.` }))
      .catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Middleware, find a panel with an ID, then embed into req.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
   static findPanelById(req, res, next, id) {
     if (!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(400).sjson({ message: 'Category ID is invalid' });
     }
     Panel.findById(id)
      .select(req._fields).sort(req._sort).exec()
      .then(panel => (req.panel = panel) ? next() : res.status(404).sjson({ message: 'Panel is not found' }))
      .catch(err => next(err));
   }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
