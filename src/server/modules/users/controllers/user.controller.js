'use strict';

import mongoose from 'mongoose';
import utils from '../../../configs/utils';
const Core = mongoose.model('Core');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');

/**
 * Controller that process user profile/settings request.
 *
 * @author C Killua
 * @module Konko/Users/Controllers/User
 */
export default class UserController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Update Profile Schema so that it meets the limit config from Core settings.
   *
   * @param {Object} res - HTTP response.
   * @returns {Response} Response 500 if error exist.
   */
  static updateSchema(res) {
    Core.find().then(cores => {
      let { profile: { username, tagline } } = cores[0];
      Profile.schema.path('username', {
        type: String,
        required: '{PATH} is required',
        minlength: username.min,
        maxlength: username.max,
        validate: {
          validator: v => {
            let regex = new RegExp(username.forbidden.join('|') || '(?!)');
            return !regex.test(v);
          },
          message: '{VALUE} is not a valid username or not allowed!',
        }
      });
      Profile.schema.path('tagline', {
        type: String,
        minlength: tagline.min,
        maxlength: tagline.max,
      });
    }).catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Response an user.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get({ user }, res) {
    user.populate('profile preference').populate({
      path: 'bookmarks',
      select: '_id title author panel date views comments',
      populate: {
        path: 'author panel',
        select: '_id profile name',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'username avatar banner',
        },
      },
    }, (err, user) => {
      if (err) {
        return res.status(500).json({ message: err });
      }
      res.status(200).json(user);
    });
  }

  /**
   * List all users or conditionally
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static list(req, res, next) {
    let q = req.query.search;
    let option = {};
    req.checkQuery('search', '').isEmail();
    if (q) {
      if (mongoose.Types.ObjectId.isValid(q)) {
        option = { _id: q };
      } else if (!req.validationErrors()) {
        option = { email: q };
      } else {
        Profile.findOne({ username: q }).then(profile => {
          User.find({ profile: profile }).populate('profile').select(req._fields).sort(req._sort).exec().then(users => {
            res.status(200).json(users);
          }).catch(err => next(err));
        }).catch(err => next(err));
        return;
      }
    }

    User.find(option).populate('profile').select(req._fields).sort(req._sort).exec().then(users => {
      res.status(200).json(users);
    }).catch(err => next(err));
  }

  /**
   * Update user
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static update({ body, user }, res) {
    User.findById(user).then(user => {
      utils.partialUpdate(body, user, 'permission', 'verified');
      user.save()
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).json({ message: err }));
    }).catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Response a user's profile
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static getProfile({ user: { profile } }, res, next) {
    Profile.findById(profile)
      .then(profile => res.status(200).json(profile))
      .catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Update an user profile.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static updateProfile({ body, user: { profile }, payload }, res) {
    UserController.updateSchema(res);
    Profile.findOne({ username: body.username }).then(p => {
      if (p && !p.equals(profile)) {
        return res.status(500).json({ message: 'This username is already used.' });
      }
      Profile.findById(profile).then(profile => {
        utils.partialUpdate(body, profile, 'username', 'tagline', 'gender', 'dob', 'tokenLive', 'avatar', 'banner');
        let error = profile.validateSync();
        if (error && error.errors.username.message) {
          return res.status(500).json({ message: error.errors.username.message });
        }
        profile.save()
          .then(profile => res.status(200).json(profile))
          .catch(err => res.status(500).json({ message: err }));
      }).catch(err => res.status(500).json({ message: err }));
    }).catch(err => res.status(500).json({ message: err }));

  }

  /**
   * Response a user's preference
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static getPreference({ user: { preference } }, res, next) {
    Preference.findById(preference)
      .then(preference => res.status(200).json(preference))
      .catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Update an user profile.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static updatePreference({ body, user: { preference } }, res) {
    Preference.findById(preference)
      .then(preference => {
        utils.partialUpdate.apply(null, [body, preference].concat(Object.keys(body)));
        preference.save()
          .then(preference => res.status(200).json(preference))
          .catch(err => res.status(500).json({ message: err }));
      })
      .catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Response a user's bookmarks
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @static
   */
  static getBookmarks({ user }, res, next) {
    user.populate({
      path: 'bookmarks',
      select: '_id author date title views replies panel lastReplies',
      populate: [{
        path: 'author',
        model: 'User',
        select: '_id profile',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'username avatar',
        },
      }, {
        path: 'panel',
        model: 'Panel',
        select: '_id name',
      }, {
        path: 'lastReplies',
        model: 'Comment',
        select: '_id author short',
        populate: {
          path: 'author',
          model: 'User',
          select: '_id profile',
          populate: {
            path: 'profile',
            model: 'Profile',
            select: 'username avatar',
          },
        }
      }],
      options: {
        sort: { date: -1 },
      },
    }, (err, user) => {
      if (err) {
        return res.status(500).json({ message: err });
      }
      res.status(200).json(user.bookmarks);
    });
  }

  /**
   * Remove a bookmark
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static removeBookmark({ user, topic }, res) {
    user.bookmarks.remove(topic);
    user.save().then(u => {
      topic.unbookmark(u._id.toString()).then(t => {
        res.status(204).json({});
      }).catch(err => res.status(500).json({ message: err }));
    }).catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Response user's permission
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static getPermission({ user: { permission } }, res) {
    res.status(200).json({ permission: permission });
  }

  /**
   * Set user's permission
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static setPermission({ body, user }, res) {
    user.permission = body.permission;
    user.save().then(u => {
      res.status(204).json({});
    }).catch(err => res.status(500).json({ message: err }));
  }

  /**
   * Middleware that finds a user with given id.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} id - Mongo object id.
   * @static
   */
  static findUserById(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'User ID is invalid' });
    }

    let select = id === req.payload._id ? '-hash -salt' : '-email -hash -salt';
    User.findById(id).select(select).exec()
      .then(user => (req.user = user) ? next() : res.status(404).json({ message: 'User is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
