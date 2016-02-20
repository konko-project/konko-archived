'use strict';

import passport from 'passport';
import passportLocal from 'passport-local';
import mongoose from 'mongoose';

const LocalStrategy = passportLocal.Strategy;

/**
 * Configurate passport for account authentication.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Passport
 */
export default () => {
  const User = mongoose.model('User');
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
