'use strict';

import mongoose from 'mongoose';
const Panel = mongoose.model('Panel');

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
   * Get a panel then populates it, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get(req, res) {
    req.panel.populate('parent', '_id name')
      .populate({
        path: 'children',
        select: '_id name description order topics comments',
        options: {
          sort: { order: -1 },
        },
      }, (err, panel) => {
        if (err) {
          res.status(500).send({ message: err });
        }

        res.json(req.panel);
      });
  }

  /**
   * Query all panels then populates them, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list(req, res) {
    Panel.find().lean().sort('name')
      .populate({
        path: 'children',
        select: '_id name',
        options: { sort: { order: -1 } },
      }).exec()
      .then(panels => res.json(panels))
      .catch(err => res.status(500).send({ message: err }));
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
    req.checkBody('name', 'Panel name cannot be empty!').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({ message: errors });
    }

    let user = req.payload;

    Panel.create(req.body)
      .then(panel => {
        if (req.category) {
          panel.category = req.category;
          panel.save()
            .then(panel => {
              req.category.panels.push(panel);
              req.category.save()
                .then(category => res.json(panel))
                .catch(err => next(err));
            })
            .catch(err => next(err));
        } else if (req.panel) {
          panel.parent = req.panel;
          panel.category = req.panel.category;
          panel.save()
            .then(panel => {
              req.panel.children.push(panel);
              req.panel.save()
                .then(_panel => res.json(panel))
                .catch(err => next(err));
            })
            .catch(err => next(err));
        } else {
          return res.status(400).send({ message: 'Error: Missing Category or Parent' });
        }
      })
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Update a panel with values from request body, if has any.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update(req, res) {
    let panel = req.panel;

    panel.name = req.body.name || panel.name;
    panel.order = req.body.order || panel.order;
    panel.description = req.body.description;

    panel.save()
      .then(panel => res.json(panel))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Delete a panel then response back HTTP 200.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static delete(req, res) {
    req.panel.remove()
      .then(() => res.status(200).send({ message: 'ok' }))
      .catch(err => res.status(500).send({ message: err }));
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
       return res.status(400).send({
         message: 'Category ID is invalid',
       });
     }

     Panel.findById(id)
      .select(req.query.fields ? req.query.fields.join(' ') : '-category -last -order')
      .exec()
      .then(panel => (req.panel = panel) ? next() : res.status(404).send({ message: 'Panel is not found' }))
      .catch(err => next(err));
   }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
