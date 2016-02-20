'use strict';

import passport from 'passport';
import mongoose from 'mongoose';

const LocalStrategy = passport.Strategy;
const User = mongoose.model('User');

/**
 * Configurate passport for account authentication.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Passport
 */
export default () => {
  passport.use(new LocalStrategy({
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
