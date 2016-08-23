'use strict';

import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Topic = mongoose.model('Topic');
const Comment = mongoose.model('Comment');
const Panel = mongoose.model('Panel');
const User = mongoose.model('User');
const Core = mongoose.model('Core');

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
   * Update Topic Schema so that it meets the limit config from Core settings.
   *
   * @param {Object} res - HTTP response.
   * @returns {Response} Response 500 if error exist.
   */
  static updateSchema(res) {
    return new Promise((resolve, reject) => {
      Core.find().then(cores => {
        let { post: { topic: { title, content } } } = cores[0];
        Topic.schema.path('title', {
          type: String,
          required: '{PATH} is required',
          minlength: title.min,
          maxlength: title.max,
        });
        Topic.schema.path('content', {
          type: String,
          required: '{PATH} is required',
          minlength: content.min,
          maxlength: content.max,
        });
        resolve(cores[0]);
      }).catch(err => res.status(500).sjson({ message: err }));
    }).then(core => core);
  }

  /**
   * Get a topic then populates it, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get({ topic }, res) {
    topic.view().then(topic => {
      topic.populate('panel', '_id name')
        .populate({
          path: 'author',
          select: '_id profile permission',
          populate: {
            path: 'profile',
            model: 'Profile',
            select: 'username avatar tagline',
          },
        }, (err, topic) => {
          if (err) {
            return res.status(500).sjson({ message: err });
          }

          res.status(200).sjson(topic);
        });
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Query all topics in a panel, then populates them, response as json.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static list({ query, sanitizeQuery, _sort, payload }, res, next) {
    let select = {};
    let project = {
      _id: 1,
      title: 1,
      date: 1,
      views: 1,
      lastReplies: '$comments',
      replies: { $size: '$comments' },
      lastReplyDate: 1,
      author: 1,
    };
    sanitizeQuery('page').toInt();
    let page = {
      page: query.page || 1,
      pages: 0,
      size: payload.preference.topicListLimit,
      offset: ((query.page || 1) - 1) * payload.preference.topicListLimit,
      uid: query.uid,
      pid: query.pid,
      sort: {},
      topics: [],
    };
    if (page.uid) {
      select = { author: mongoose.Types.ObjectId(page.uid) };
      project.content = 1;
      project.panel = 1;
      page.sort = _sort || { date: -1 };
    } else if (page.pid) {
      select = { panel: mongoose.Types.ObjectId(page.pid) };
      project.lastReplyDate = 1;
      page.sort = _sort || { lastReplyDate: -1 };
    } else {
      return res.status(400).sjson({ message: 'Bad Request' });
    }

    Core.findOne().then(({ post: { topic: { lastReplyLength } } }) => {
      Topic.aggregate([
        { $match: select },
        { $sort: page.sort },
        { $skip: page.offset },
        { $limit: page.size },
        { $project: project },
      ]).exec().then(topics => {
        Topic.populate(topics, {
          path: 'panel',
          select: '_id name',
        }).then(topics => {
          Topic.populate(topics, {
            path: 'author',
            select: '_id profile',
            populate: {
              path: 'profile',
              model: 'Profile',
              select: 'username avatar',
            },
          }).then(topics => {
            Topic.populate(topics, {
              path: 'lastReplies',
              model: 'Comment',
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
              options: {
                sort: { date: -1 },
                limit: lastReplyLength,
              }
            }).then(topics => {
              Topic.count(select).then(count => {
                page.pages = Math.ceil(count / page.size);
                page.topics = topics;
                res.status(200).sjson(page);
              }).catch(err => next(err));
            }).catch(err => next(err));
          }).catch(err => next(err));
        }).catch(err => next(err));
      }).catch(err => next(err));
    }).catch(err => next(err));
  }

  /**
   * Create a topic with values from request body.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static create({ checkBody, checkQuery, validationErrors, body, query, payload }, res, next) {
    TopicController.updateSchema(res).then(core => {
      checkBody('title', 'Title cannot be empty!').notEmpty();
      checkBody('content', 'Cannot post a empty topic!').notEmpty();
      checkQuery('panelId', 'Panel ID is not presented!').notEmpty();
      let errors = validationErrors();
      if (errors) {
        return res.status(400).sjson({ message: utils.validationErrorMessage(errors) });
      }

      Topic.create(body).then(topic => {
        Panel.findById(mongoose.Types.ObjectId(query.panelId)).exec().then(panel => {
          if (!panel) {
              return res.status(404).sjson({ message: 'Panel not found' });
          }

          topic.author = payload;
          topic.panel = panel;
          topic.save().then(topic => {
            panel.last.shift();
            panel.last.push(topic);
            panel.addtopic().then(panel => res.status(201).sjson(topic)).catch(err => next(err));
          }).catch(err => next(err));
        }).catch(err => next(err));
      }).catch(err => next(err));
    }).catch(err => next(err));
  }

  /**
   * Update a topic with values from request body, if has any.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update({ checkBody, validationErrors, body, topic, payload }, res) {
    TopicController.updateSchema(res).then(core => {
      checkBody('title', 'Title cannot be empty!').notEmpty();
      checkBody('content', 'Cannot post a empty topic!').notEmpty();
      let errors = validationErrors();
      if (errors) {
        return res.status(400).sjson({ message: utils.validationErrorMessage(errors) });
      }

      utils.partialUpdate(body, topic, 'title', 'content');
      topic.updated.date = Date.now();
      topic.updated.by = payload.profile.username;
      topic.save()
        .then(topic => res.status(200).sjson(topic))
        .catch(err => res.status(500).sjson({ message: err }));
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Delete a topic then response back HTTP 200.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static delete({ topic }, res) {
    Comment.remove({ topic: topic }).then(() => {
      topic.remove()
        .then(res.status(200).sjson({ message: 'ok' }))
        .catch(err => res.status(500).sjson({ message: err }));
    }).catch(err => res.status(500).sjson({ message: err }));
  }

  /**
   * Calls model Topic method that doing like
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static like({ topic, payload }, res, next) {
    if (topic.likes.indexOf(payload._id) >= 0) {
      return res.status(403).sjson({ message: 'Forbidden' });
    } else {
      topic.like(payload._id)
        .then(topic => res.status(200).sjson({ likes: topic.likes }))
        .catch(err => next(err));
    }
  }

  /**
   * Calls model Topic method that doing un-like
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static dislike({ topic, payload }, res, next) {
    if (topic.likes.indexOf(payload._id) < 0) {
      return res.status(200).sjson({ likes: topic.likes });
    } else {
      topic.unlike(payload._id)
        .then(topic => res.status(200).sjson({ likes: topic.likes }))
        .catch(err => next(err));
    }
  }

  /**
   * Calls model Topic mothed that doing bookmark
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static bookmark({ topic, payload }, res, next) {
    if (topic.bookmarks.indexOf(payload._id) >= 0){
      return res.status(403).sjson({ message: 'Forbidden' });
    } else {
      User.findById(payload._id).then(user => {
        if (!user) {
          return res.status(404).sjson({ message: 'User not found' });
        }
        topic.bookmark(payload._id).then(topic => {
          user.bookmarks.push(topic);
          user.save().then(user => res.status(200).sjson({ bookmarks: topic.bookmarks }))
            .catch(err => res.status(500).sjson({ message: err }));
        }).catch(err => res.status(500).sjson({ message: err }));
      }).catch(err => res.status(500).sjson({ message: err }));
    }
  }

  /**
   * Check if topic is bookmarked.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static bookmarked({ topic, payload }, res, next) {
    return topic.bookmarks.indexOf(payload._id) < 0 ? res.status(404).sjson({ message: 'Bookmark not exists for this user.' }) : res.status(204).sjson({});
  }

  /**
   * Calls model Topic method that doing un-bookmark
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static unbookmark({ topic, payload }, res, next) {
    User.findById(payload._id).then(user => {
      if (!user) {
        return res.status(404).sjson({ message: 'User not found' });
      }
      user.bookmarks.remove(topic);
      user.save().then(user => {
        if (topic.bookmarks.indexOf(payload._id) < 0) {
          return res.status(204).sjson({});
        } else {
          topic.unbookmark(payload._id)
            .then(topic => res.status(200).sjson({ bookmarks: topic.bookmarks }))
            .catch(err => next(err));
        }
      }).catch(err => res.status(500).sjson({ message: err }));
    }).catch(err => res.status(500).sjson({ message: err }));
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
      return res.status(400).sjson({ message: 'Topic ID is invalid' });
    }

    Topic.findById(id)
      .select(req._fields ? req._fields + ' views' : '').exec()
      .then(topic => (req.topic = topic) ? next() : res.status(404).sjson({ message: 'Topic is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
