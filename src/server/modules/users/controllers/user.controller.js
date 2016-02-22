'use strict';

import mongoose from 'mongoose';
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
   * Response an user.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static get(req, res) {
    req.user.populate('profile preference', (err, user) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.json(user);
    });
  }

  /**
   * Update an user profile.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static updateProfile(req, res) {
    if (!req.user._id.equals(req.payload._id)) {
      return res.status(401).send('Unauthorized');
    }

    Profile.findById(req.user.profile).exec()
      .then(profile => {
        profile.username = req.body.profile.username || profile.username;
        profile.avatar = req.body.profile.avatar || profile.avatar;
        profile.banner = req.body.profile.banner || profile.banner;
        profile.gender = req.body.profile.gender || profile.gender;
        profile.dob = req.body.profile.dob || profile.dob;
        profile.save()
          .then(profile => res.json(profile))
          .catch(err => res.status(500).send({ message: err }));
      })
      .catch(err => res.status(500).send({ message: err }));
  }

  /**
   * Update an user profile.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static updatePreference(req, res) {
    if (!req.user._id.equals(req.payload._id)) {
      return res.status(401).send('Unauthorized');
    }

    Preference.findById(req.user.preference).exec()
      .then(preference => {
        preference = req.body.preference;
        preference.save()
          .then(preference => res.json(preference))
          .catch(err => res.status(500).send({ message: err }));
      })
      .catch(err => res.status(500).send({ message: err }));
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
      return res.status(400).send({ message: 'User ID is invalid' });
    }

    User.findById(id).select('_id joined profile preference').exec()
      .then(user => (req.user = user) ? next() : res.status(404).send({ message: 'User is not found' }))
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
