'use strict';

import mongoose from 'mongoose';
const Comment = mongoose.model('Comment');
const Panel = mongoose.model('Panel');

/**
 * Controller that process comment request.
 *
 * @author C Killua
 * @module Konko/Posts/Controllers/Comment
 */
export default class CommentController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Get a comment then populates it, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get(req, res) {
    req.comment.populate({
      path: 'author',
      select: '_id profile',
      populate: {
        path: 'profile',
        model: 'Profile',
        select: 'username avatar',
      },
    }, (err, comment) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      res.json(comment);
    });
  }

  /**
   * Query all comments of a topic then populates them, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static list(req, res) {
    req.sanitizeQuery('offset').toInt();
    req.sanitizeQuery('limit').toInt();
    let errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({ message: errors });
    }

    if (req.query.limit === 0) {
      req.query.limit = 20;
    }

    Comment.find({ topic: req.topic._id }, '-short', { skip: req.query.offset, limit: req.query.limit })
      .lean().sort('-date')
      .populate('topic', '_id')
      .populate({
        path: 'author',
        model: 'User',
        select: '_id profile',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'username avatar',
        },
      }).exec()
      .then(comments => res.json(comments))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Create a comment with values from request body.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create(req, res, next) {
    req.checkBody('content', 'Empty comment!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({ message: errors });
    }

    Comment.create(req.body)
      .then(comment => {
        let max = comment.content.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/) ? 15 : 30;
        comment.short = comment.content.length < 15 ? comment.content : comment.content.substring(0, max).match(/((^.{0,20})(?=[ ]))|(^.{0,20}(?=.))/g) + ' ...';
        comment.topic = req.topic;
        comment.author = req.payload;
        comment.save()
          .then(comment => {
            req.topic.comments.push(comment);

            // storing last 3 recent comments
            req.topic.last.unshift(comment);
            if (req.topic.last.length > 3) {
              req.topic.last.pop();
            }

            req.topic.lastd = comment.date;
            req.topic.save()
              .then(topic => {
                req.topic.reply()
                  .then(topic => {
                    Panel.findById(mongoose.Types.ObjectId(topic.panel)).exec()
                      .then(panel => {
                        panel.addComment()
                          .then(panel => res.json(comment))
                          .catch(err => next(err));
                      })
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
   * Update a comment with values from request body, if has any.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update(req, res) {
    let comment = req.comment;
    comment.content = req.body.content || comment.content;
    comment.updated = Date.now();

    comment.save()
      .then(comment => res.json(comment))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Delete a comment then response back HTTP 200.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static delete(req, res) {
    let user = req.payload;

    req.comment.remove()
      .then(() => res.status(200).send({ message: 'ok' }))
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Calls model Comment method that doing upvate
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   */
  static upvote(req, res, next) {
    req.comment.upvote()
      .then(comment => res.json(comment))
      .catch(err => next(err));
  }

  /**
   * Calls model Comment method that doing downvote
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   */
  static downvote(req, res, next) {
    req.comment.downvote()
      .then(comment => res.json(comment))
      .catch(err => next(err));
  }

  /**
   * Middleware, find a comment with an ID, then embed into req.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
  static findCommentById(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'Comment ID is invalid',
      });
    }

    Comment.findById(id).exec()
      .then(comment => (req.comment = comment) ? next() : res.status(404).send({ message: 'Comment is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
