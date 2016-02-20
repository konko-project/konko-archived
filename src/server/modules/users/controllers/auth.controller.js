'use strict';

import passport from 'passport';
import mongoose from 'mongoose';
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const VerificationToken = mongoose.model('VerificationToken');

/**
 * Controller that process authentication request.
 *
 * @author C Killua
 * @module Konko/Users/Controllers/Authentication
 */
export default class AuthenticationController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Register a new user.
   *
   * @param {Object} app - Express app.
   * @returns {Function} A function that actually process the request.
   */
  static register(app) {
    return (req, res, next) => {
      req.checkBody('email', 'Invalid Email').isEmail();
      req.checkBody('password', 'Empty Password').notEmpty();
      let errors = req.validationErrors();
      if (errors) {
        return res.status(400).send({ message: errors });
      }

      User.create(req.body)
        .then(user => {
          user.setPassword(req.body.password);
          Profile.create({ username: user.email.replace(/\@.*/g, '') })
            .then(profile => {
              user.profile = profile;
              Preference.create()
                .then(preference => {
                  user.preference = preference;
                  user.save()
                    .then(user => {
                      VerificationToken.create({ user: user })
                        .then(token => {
                          const doc = {
                            email: user.email,
                            url: req.protocol + '://' + req.get('host') +
                                  '/verify/' + token,
                          };
                          app.mailer.send('jade/activate', {
                            to: user.email,
                            subject: 'Welcome!',
                            doc: doc,
                          }, err => {
                            if (err) {
                              return res.status(500).send(err);
                            }

                            return res.json({ token: user.generateJWT(app) });
                          });
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
    };
  }

  /**
   * Log an user in.
   *
   * @param {Object} app - Express app.
   * @returns {Function} A function that actually process the request.
   */
  static login(app) {
    return (req, res, next) => {
      req.checkBody('email', 'Invalid Email').isEmail();
      req.checkBody('password', 'Invalid Password').notEmpty();
      let errors = req.validationErrors();
      if (errors) {
        return next(errors);
      }

      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        } else if (user) {
          user.populate('profile', (err, user) => {
            if (err) {
              return next(err);
            }

            user.login()
              .then(user => {
                return res.json({ token: user.generateJWT(app) });
              })
              .catch(err => next(err));
          });
        } else {
          return res.status(401).json(info);
        }
      })(req, res, next);
    };
  }

  /**
   * Verify a activation token.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @static
   */
  static verify(req, res) {
    User.findById(req.token.user).exec()
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: 'User does not exist.' });
        }

        user.verified = true;
        user.save()
          .then(user => {
            req.token.remove()
              .then(() => res.status(200).send({ message: 'ok' }))
              .catch(err => res.status(500).json(err));
          })
          .catch(err => res.status(500).json(err));
      })
      .catch(err => res.status(500).json(err));
  }

  /**
   * Response back latest user info.
   *
   * @param {Object} app - Express app.
   * @returns {Function} A function that actually process the request.
   */
  static sync(app) {
    return (req, res, next) => {
      User.findById(req.payload)
        .populate('profile').exec()
        .then(user => {
          return res.json({ token: user.generateJWT(app) });
        })
        .catch(err => next(err));
    };
  }

  /**
   * Middleware, find the correct token, then embed into req.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @param {String} token - UUID token.
   * @static
   */
  static findToken(req, res, next, token) {
    VerificationToken.findOne({ token: token }).exec()
      .then(token => {
        return (req.token = token) ? next() :
          res.status(404).send({
            message: 'Verification token is expired or invalid.',
          });
      })
      .catch(err => next(err));
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
