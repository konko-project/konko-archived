'use strict';

import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Report = mongoose.model('Report');

/**
 * Controller that process report request.
 *
 * @author C Killua
 * @module Konko/Core/Controllers/Report
 */
export default class ReportController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Response back a Report
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get({ report }, res) {
    report.populate({
      path: 'reporter',
      select: 'profile',
      populate: {
        path: 'profile',
        model: 'Profile',
        select: 'username',
      },
    }, (err, report) => {
      return err ? res.status(500).json({ message: err }) : res.status(200).json(report);
    });
  }

  /**
   * Response back all Reports
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list({ _fields, _sort }, res) {
    Report.find({ done: false }).select(_fields).sort(_sort).lean()
      .populate({
        path: 'reporter',
        select: 'profile',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'username',
        },
      }).exec()
      .then(reports => res.status(200).json(reports))
      .catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Create a Report with values from request body
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create({ body, checkBody, validationErrors, payload }, res, next) {
    checkBody('iid', 'ID of the inappropriate cannot be empty!').notEmpty();
    checkBody('type', 'Type of the inappropriate cannot be empty!').notEmpty();
    checkBody('url', 'Url of the inappropriate cannot be empty!').notEmpty();
    checkBody('reason', 'Reason of the inappropriate cannot be empty!').notEmpty();
    let errors = validationErrors();
    if (errors) {
      return res.status(400).json({ message: errors });
    }
    Report.create(body).then(report => {
      report.reporter = payload;
      report.save().then(report => res.status(201).json(report))
        .catch(err => next(err));
    }).catch(err => next(err));
  }

  /**
   * Update a Report with given fields
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update({ body, report, _fields }, res) {
    utils.partialUpdate(body, report, _fields);
    report.save()
      .then(report => res.status(200).json(report))
      .catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Set Report state to done(handled)
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static done({ report }, res) {
    report.processed().then(report => res.status(200).json(report))
      .catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Middleware that finds report with given id.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
  static findReportById(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Report ID is invalid' });
    }

    Report.findById(id).exec()
      .then(report => (req.report = report) ? next() : res.status(404).json({ message: 'Report is not found.' }))
      .catch(err => next(err));
  }

}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
