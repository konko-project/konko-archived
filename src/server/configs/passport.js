'use strict';

import passport from 'passport';
import { Strategy } from 'passport-local';
import mongoose from 'mongoose';

/**
 * Configurate passport for account authentication.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Passport
 */
export default () => {
  const User = mongoose.model('User');
  passport.use(new Strategy({
    usernameField: 'email',
  }, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        return done(err);
      } else if (!user || !user.validPassword(password)) {
        return done(null, false, {
          message: 'Invalid Email or Password.',
        });
      }

      return done(null, user);
    });
  }));
};
