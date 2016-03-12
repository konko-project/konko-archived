'use strict';

import passport from 'passport';
import mongoose from 'mongoose';
const Core = mongoose.model('Core');
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
   * Update Profile Schema so that it meets the limit config from Core settings.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @returns {Response} Response 500 if error exist.
   */
  static updateSchema(req, res) {
    return new Promise((resolve, reject) => {
      Core.find().then(cores => {
        let { profile, registration: { blacklist } } = cores[0];
        Profile.schema.path('username', {
          type: String,
          required: '{PATH} is required',
          minlength: profile.username.min,
          maxlength: profile.username.max,
          validate: {
            validator: v => {
              let regex = new RegExp(profile.username.forbidden.join('|') || '(?!)');
              return !regex.test(v);
            },
            message: '"{VALUE}" is not a valid username!',
          }
        });
        User.schema.path('email', {
          type: String,
          unique: true,
          lowercase: true,
          required: '{PATH} is required',
          validate: {
            validator: v => {
              let r = blacklist.length ? '(\\b' + blacklist.join('\\b)|(\\b') + '\\b)' : '(?!)';
              let regex = new RegExp(r, 'g');
              return !regex.test(v);
            },
            message: '"{VALUE}" is not a valid Email!',
          }
        });
        resolve(cores[0]);
      }).catch(err => reject(err).then((err) => {}).then(err => err));
    }).then(core => core);
  }

  /**
   * Register a new user.
   *
   * @param {Object} app - Express app.
   * @returns {Function} A function that actually process the request.
   */
  static register(app) {
    return (req, res, next) => {
      AuthenticationController.updateSchema(req, res).then(core => {
        if (!core.registration.public) {
          return res.status(503).json({ message: core.registration.message });
        }
        req.checkBody('email', 'Invalid Email').isEmail();
        req.checkBody('password', 'Empty Password').notEmpty();
        let errors = req.validationErrors();
        if (errors) {
          return res.status(400).json({ message: errors });
        }

        let password = req.body.password;
        if (!RegExp(core.registration.password.regex).test(password)) {
          return res.status(400).json({ message: 'Password does not meet the requirement.' });
        }
        User.create(req.body).then(user => {
          let username = user.email.replace(/\@.*/g, '');
          const usernameGen = username => {
            return new Promise(resolve => {
              Profile.findOne({ username: username }).then(profile => {
                if (profile) {
                  let timestamp = Date.now().toString();
                  username += timestamp.substring(timestamp.length - 6);
                  resolve([username, false]);
                } else {
                  resolve([username, true]);
                }
              });
            }).then(values => {
              let [username, done] = values;
              return done ? username : usernameGen(username);
            });
          };
          usernameGen(username).then(username => {
            user.setPassword(password);
            Profile.create({ username: username }).then(profile => {
              user.profile = profile;
              Preference.create().then(preference => {
                user.preference = preference;
                user.save().then(user => {
                  if (core.registration.email.verification && process.env.NODE_ENV !== 'test') {
                    VerificationToken.create({ user: user }).then(token => {
                      const doc = {
                        email: user.email,
                        url: req.protocol + '://' + req.get('host') +
                              '/verify/' + token.token,
                      };
                      app.mailer.send('jade/activate', {
                        to: user.email,
                        subject: core.registration.email.verificationSubject,
                        doc: doc,
                      }, err => {
                        return err ? res.status(500).json(err) : res.status(201).json({ token: user.generateJWT(app) });
                      });
                    }).catch(err => next(err));
                  } else {
                    user.verify = true;
                    user.save().then(user => {
                      res.status(201).json({ token: user.generateJWT(app) });
                    }).catch(err => next(err));
                  }
                }).catch(err => next(err));
              }).catch(err => next(err));
            }).catch(err => next(err));
          }).catch(err => next(err));
        }).catch(err => next(err));
      }).catch(err => next(err));
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
        return res.status(400).json({ message: errors });
      }
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        } else if (user) {
          user.populate('profile preference', (err, user) => {
            if (err) {
              return next(err);
            }
            user.login().then(user => {
              return res.status(200).json({ token: user.generateJWT(app) });
            }).catch(err => next(err));
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
          return res.status(404).json({ message: 'User does not exist.' });
        }
        user.verified = true;
        user.save()
          .then(user => {
            req.token.remove()
              .then(() => res.status(200).json({ message: 'ok' }))
              .catch(err => res.status(500).json(err));
          }).catch(err => res.status(500).json(err));
      }).catch(err => res.status(500).json(err));
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
        .populate('profile preference').exec()
        .then(user => {
          return res.status(200).json({ token: user.generateJWT(app) });
        }).catch(err => next(err));
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
          res.status(404).json({
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
