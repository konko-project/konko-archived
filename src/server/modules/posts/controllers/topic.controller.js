'use strict';

import mongoose from 'mongoose';
const Topic = mongoose.model('Topic');
const Panel = mongoose.model('Panel');

/**
 * Controller that process topic request.
 *
 * @author C Killua
 * @module Konko/Posts/Controllers/Topic
 */
export default class TopicController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Get a topic then populates it, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get(req, res) {
    req.topic.view()
      .then(topic => {
        topic.populate('panel', '_id name')
          .populate({
            path: 'author',
            select: '_id profile',
            populate: {
              path: 'profile',
              model: 'Profile',
              select: 'username avatar',
            },
          }, (err, topic) => {
            if (err) {
              return res.status(500).send({ message: err });
            }

            res.json(topic);
          });
      })
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Query all topics in a panel, then populates them, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static list(req, res, next) {
    let select = {};
    let sort = {};
    let optional = '';
    if (req.query && req.query.userId) {
      select = { author: req.query.userId };
      optional = 'content panel';
      sort = { date: -1 };
    } else if (req.query && req.query.panelId) {
      select = { panel: req.query.panelId };
      sort = { lastd: -1 };
    } else {
      return res.status(400).send('Bad Request');
    }

    req.sanitizeQuery('offset').toInt();
    req.sanitizeQuery('limit').toInt();

    if (req.query.limit === 0) {
      req.query.limit = 20;
    }

    Topic.find(select, '_id author title update date replies views last' + optional)
      .lean().sort(sort).skip(req.query.offset).limit(req.query.limit)
      .populate('panel', '_id name')
      .populate({
        path: 'author',
        select: '_id profile',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'username avatar',
        },
      })
      .populate({
        path: 'last',
        select: '_id date short author',
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
      }).exec()
      .then(topics => res.json(topics))
      .catch(err => next(err));
  }

  /**
   * Create a topic with values from request body.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create(req, res, next) {
    req.checkBody('title', 'Title cannot be empty!').notEmpty();
    req.checkBody('content', 'Cannot post a empty topic!').notEmpty();
    req.checkQuery('panelId', 'Panel ID is not presented!').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }

    Topic.create()
      .then(topic => {
        topic.author = req.payload;
        Panel.findById(mongoose.Types.ObjectId(req.query.panelId)).exec()
          .then(panel => {
            topic.panel = panel;
            topic.save()
              .then(topic => {
                panel.last.shift();
                panel.last.push(topic);
                panel.save()
                  .then(panel => {
                    panel.addtopic()
                      .then(panel => res.json(topic))
                      .catch(err => next(err));
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  }

  /**
   * Update a topic with values from request body, if has any.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update(req, res) {
    let topic = req.topic;
    topic.title = req.body.title || topic.title;
    topic.content = req.body.content || topic.content;
    topic.updated.date = Date.now();
    topic.updated.by = req.payload.username;

    topic.save()
      .then(topic => res.json(topic))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Delete a topic then response back HTTP 200.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static delete(req, res) {
    let user = req.payload;

    req.topic.remove()
      .then(() => res.status(200).send({ message: 'ok' }))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Calls model Topic method that doing upvate
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   */
  static upvote(req, res, next) {
    req.topic.upvote()
      .then(topic => res.json(topic))
      .catch(err => next(err));
  }

  /**
   * Calls model Topic method that doing downvote
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   */
  static downvote(req, res, next) {
    req.topic.downvote()
      .then(topic => res.json(topic))
      .catch(err => next(err));
  }

  /**
   * Middleware, find a topic with an ID, then embed into req.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
  static findTopicById(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'Comment ID is invalid',
      });
    }

    Topic.findById(id)
      .select(req.query.fields ? req.query.fields.join(' ') : '').exec()
      .then(topic => (req.topic = topic) ? next() : res.status(404).send({ message: 'Topic is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
