'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Report = mongoose.model('Report');
const Comment = mongoose.model('Comment');

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
      return err ? res.status(500).sjson({ message: err }) : res.status(200).sjson(report);
    });
  }

  /**
   * Response back all Reports
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list({ _fields, _sort, payload }, res) {
    Report.find({ done: false }).select(_fields).sort(_sort).lean()
      .populate({
        path: 'reporter',
        select: 'profile',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'username',
        },
      }).exec().then(reports => {
        const fixReporter = report => {
          return new Promise(resolve => {
            report.reporter = { profile: { username: 'Anonymous' } };
            resolve(report.reporter);
          });
        };
        const fixUrl = report => {
          let [, tid, cid] = /\/t\/(.*?)(?:\/page\/\d*)?#(.*)/g.exec(report.url);
          let size = payload.preference.commentListLimit;
          return new Promise((resolve, reject) => {
            Comment.find({ topic: tid }).lean().sort('-date').exec().then(comments => {
              let page = Math.floor(_.findIndex(comments, c => c._id.equals(cid)) / size) + 1;
              report.url = `/t/${tid}/page/${page}#${cid}`;
              resolve(report.url);
            }).catch(err => reject(err));
          });
        };
        Promise.all(_.map(_.filter(reports, { reporter: null }), fixReporter).concat(_.map(_.filter(reports, { type: 'comment' }), fixUrl))).then(values => {
          res.status(200).sjson(reports);
        }, reason => res.status(500).sjson({ message: reason }));
      }).catch(err => res.status(500).sjson({ message: err }));
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
      return res.status(400).sjson({ message: utils.validationErrorMessage(errors) });
    }
    Report.create(body).then(report => {
      report.reporter = payload;
      report.save().then(report => res.status(201).sjson(report)).catch(err => next(err));
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
    utils.partialUpdate(body, report, ..._fields.split(' '));
    report.save()
      .then(report => res.status(200).sjson(report))
      .catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Set Report state to done(handled)
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static done({ report }, res) {
    report.processed().then(report => res.status(200).sjson(report))
      .catch(err => res.status(500).sjson({ message: err }));
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
      return res.status(400).sjson({ message: 'Report ID is invalid' });
    }

    Report.findById(id).exec()
      .then(report => (req.report = report) ? next() : res.status(404).sjson({ message: 'Report is not found.' }))
      .catch(err => next(err));
  }

}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
