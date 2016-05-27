'use strict';

const Unknown = 'Unknown error.';
const MissingToken = 'Missing user token.';
const MissingOwner = 'Onwer type is missing for the document.';
const NoPermToAccess = 'You do not have permission to access.';

/**
 * Permission validation middleware.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Permission
 */
export default class PermissionMiddleware {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Helper that routes to the correct permission validator.
   *
   * @param {String} permission - Permission that need to be validate.
   * @param {String} model - Optional, if need to specify a model in req.
   *                         Required for validating author of an document.
   * @returns {Function} Validator that validates the permission.
   */
  static get(permission, model = null) {
    return (req, res, next) => {
      if(model) {
        req._docs = req[model];
      }
      PermissionMiddleware[permission](req, res, next);
    };
  }

  /**
   * Helper for validating user's permission to be Owner of certain docs.
   * Only Owner can access, even though they are banned.
   * Better to use on a private link, such user profile.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if user is the owner, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowOwner({ payload, _docs: { author }, user }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (!author && !user) {
      return res.status(400).json({ message: MissingOwner });
    } else if (author) {  // author will be string of ObjectId already
      return author.equals(payload._id) ? next() : res.status(401).json({ message: NoPermToAccess });
    } else if (user) {
      return user._id.equals(payload._id) ? next() : res.status(401).json({ message: NoPermToAccess });
    } else {
      return res.status(500).json({ message: Unknown });
    }
  }

  /**
   * Helper for validating user's permission to be Owner of certain docs or an Admin.
   * A banned owner will not grant permission, then only admin can access.
   * Better to use on a public link, such as topic or comment.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if user is the owner or admin,
   *          response 401 otherwise, especially when owner is banned,
   *          or 400 if JWT payload is not presented.
   */
  static allowAdminOwner({ payload, _docs: { author }, user }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (!author && !user) {
      return res.status(400).json({ message: MissingOwner });
    } else if (payload.permission === 'admin') {
      return next();
    } else if (payload.permission === 'banned') {
      return res.status(401).json({ message: NoPermToAccess });
    } else if (author) {  // author will be string of ObjectId already
      return author.equals(payload._id) ? next() : res.status(401).json({ message: NoPermToAccess });
    } else if (user) {
      return user._id.equals(payload._id) ? next() : res.status(401).json({ message: NoPermToAccess });
    } else {
      return res.status(500).json({ message: Unknown });
    }
  }

  /**
   * Helper for validating user's permission to be Admin.
   * Only Admin will grant permission to access.
   * Better to use on a system link, such as site settings.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if user is admin, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowAdmin({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (payload.permission !== 'admin') {
      return res.status(401).json({ message: NoPermToAccess });
    } else {
      next();
    }
  }

  /**
   * Helper for validating user's permission to be anything except Guest and Banned.
   * Only Admin and non-banned user (include unverified users) can access.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not guest or banned, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowUser({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (payload.permission === 'guest' || payload.permission === 'banned') {
      return res.status(401).json({ message: NoPermToAccess });
    } else {
      next();
    }
  }

  /**
   * Helper for validating user's permission to be anything except Guest.
   * Only registered user can access.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not guest, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowRegistered({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (payload.permission === 'guest') {
      return res.status(401).json({ message: NoPermToAccess });
    } else {
      next();
    }
  }

  /**
   * Helper for validating user's permission to be anything.
   * Everybody can access.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Should always call next unless JWT is missing.
   */
  static allowAll({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else {
      next();
    }
  }

  /**
   * Helper for rejecting everything.
   * Nobody can access, including admin, use responsibly.
   * Should be run after JWT for proper usage.
   *
   * @see {@link allowAdmin} for allowing admin only.
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {Response} Always response 401.
   */
  static denyAll({ payload }, res, next) {
    return res.status(401).json({ message: NoPermToAccess });
  }

  /**
   * Helper for rejecting registered User except admin.
   * User will not grant permission, but guest and admin can access.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if a registered user except admin, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static denyUser({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (payload.permission === 'banned' || payload.permission === 'user') {
      return res.status(401).json({ message: NoPermToAccess });
    } else {
      next();
    }
  }

  /**
   * Helper for rejecting Banned user.
   * Only banned user cannot access.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not a banned user, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static denyBanned({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (payload.permission === 'banned') {
      return res.status(401).json({ message: NoPermToAccess });
    } else {
      next();
    }
  }

  /**
   * Helper for rejecting Guest.
   * Only guest cannot access.
   * Should be run after JWT for proper usage.
   *
   * @see {@link allowRegistered} for allowing registered user only.
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not a guest, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static denyGuest({ payload }, res, next) {
    if (!payload) {
      return res.status(401).json({ message: MissingToken });
    } else if (payload.permission === 'guest') {
      return res.status(401).json({ message: NoPermToAccess });
    } else {
      next();
    }
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
