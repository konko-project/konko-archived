'use strict';

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
   * Helper for validating user's permission to be Admin.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if user is admin, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowAdmin({ payload }, res, next) {
    if (!payload) {
      return res.status(400).send({ message: 'Missing user token.' });
    } else if (payload.permission !== 'admin') {
      return res.status(401).send({ message: 'Only admin can access.' });
    } else {
      next();
    }
  }

  /**
   * Helper for validating user's permission to be anything except Guest and Banned.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not guest or banned, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowUser({ payload }, res, next) {
    if (!payload) {
      return res.status(400).send({ message: 'Missing user token.' });
    } else if (payload.permission === 'guest' || payload.permission === 'banned') {
      return res.status(401).send({ message: 'Only valid user can access.' });
    } else {
      next();
    }
  }

  /**
   * Helper for validating user's permission to be anything except Guest.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not guest, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static allowRegistered({ payload }, res, next) {
    if (!payload) {
      return res.status(400).send({ message: 'Missing user token.' });
    } else if (payload.permission === 'guest') {
      return res.status(401).send({ message: 'Only registered user can access.' });
    } else {
      next();
    }
  }

  /**
   * Helper for validating user's permission to be anything.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Should always call next unless JWT is missing.
   */
  static allowAll({ payload }, res, next) {
    if (!payload) {
      return res.status(400).send({ message: 'Missing user token.' });
    } else {
      next();
    }
  }

  /**
   * Helper for rejecting everything.
   * Should be run after JWT for proper usage.
   *
   * @see {@link allowAdmin} for allowing admin only.
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {Response} Always response 401.
   */
  static denyAll({ payload }, res, next) {
    return res.status(401).send({ message: 'Nobody is allowed' });
  }

  /**
   * Helper for rejecting Banned user and normal User.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if a registered user except admin, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static denyUser({ payload }, res, next) {
    if (!payload) {
      return res.status(400).send({ message: 'Missing user token.' });
    } else if (payload.permission === 'banned' || payload.permission === 'user') {
      return res.status(401).send({ message: 'User is not allowed.' });
    } else {
      next();
    }
  }

  /**
   * Helper for rejecting Banned user.
   * Should be run after JWT for proper usage.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback|Response} Call next if not a banned user, response 401 otherwise, or 400 if JWT payload is not presented.
   */
  static denyBanned({ payload }, res, next) {
    if (!payload) {
      return res.status(400).send({ message: 'Missing user token.' });
    } else if (payload.permission === 'banned') {
      return res.status(401).send({ message: 'Banned user is not allowed.' });
    } else {
      next();
    }
  }

  /**
   * Helper for rejecting Guest.
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
      return res.status(400).send({ message: 'Missing user token.' });
    } else if (payload.permission === 'guest') {
      return res.status(401).send({ message: 'Guest is not allowed.' });
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
