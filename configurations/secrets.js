'use strict';

/**
 * Default secrets, should be changed for production use
 *
 * @module Konko/Global/Configurations/Secrets
 */
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'DEFAULTJWT',
  cookieSecret: process.env.COOKIE_SECRET || 'DEFAULTCOOKIE',
};
