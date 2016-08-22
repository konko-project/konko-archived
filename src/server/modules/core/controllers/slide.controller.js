'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Slide = mongoose.model('Slide');


/**
 * Controller that process report request.
 *
 * @author C Killua
 * @module Konko/Core/Controllers/Slide
 */
export default class SlideController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Response a Slide
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get({ slide }, res) {
    res.status(200).sjson(slide);
  }

  /**
   * Response back all Slides
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list(req, res) {
    Slide.find().lean().exec().then(slides => {
      res.status(200).sjson(slides);
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  /**
  * Create a Slide with values from request body
  *
  * @param {Object} req - HTTP request.
  * @param {Object} res - HTTP response.
  * @param {nextCallback} next - A callback to run.
  * @static
   */
  static create({ body, checkBody, validationErrors }, res, next) {
    checkBody('title', 'Title of the Slide cannot be empty!').notEmpty();
    checkBody('image', 'Image of the Slide cannot be empty!').notEmpty();
    checkBody('url', 'Url of the Slide cannot be empty!').notEmpty();
    let errors = validationErrors();
    if (errors) {
      return res.status(400).sjson({ message: _.map(errors, 'msg').join('\n') });
    }

    Slide.create(body).then(slide => {
      res.status(201).sjson(slide);
    }).catch(err => next(err));
  }

  /**
   * Update a Slide
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update({ body, checkBody, validationErrors, slide }, res) {
    checkBody('title', 'Title of the Slide cannot be empty!').notEmpty();
    checkBody('image', 'Image of the Slide cannot be empty!').notEmpty();
    checkBody('url', 'Url of the Slide cannot be empty!').notEmpty();
    let errors = validationErrors();
    if (errors) {
      return res.status(400).sjson({ message: _.map(errors, 'msg').join('\n') });
    }

    utils.partialUpdate(body, slide, ...Object.keys(body));
    slide.save()
      .then(slide => res.status(200).sjson(slide))
      .catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Delete a Slide
   *
   * @param {Object} slide - Slide going to be removed.
   * @param {Object} res - HTTP response.
   * @static
   */
  static delete({ slide }, res) {
    slide.remove()
      .then(res.status(200).sjson({ message: `${slide.title} has been removed.` }))
      .catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Middleware, finds a Slide with given id, then embed into req.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
  static findSlideById(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).sjson({ message: 'Category ID is invalid' });
    }
    Slide.findById(id).exec()
      .then(slide => (req.slide = slide) ? next() : res.status(404).sjson({ message: 'Slide is not found' }))
      .catch(err => next(err));
  }

}
