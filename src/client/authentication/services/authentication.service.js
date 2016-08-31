'use strict';

const HTTP = new WeakMap();
const STATE = new WeakMap();
const WINDOW = new WeakMap();
const ROOTSCOPE = new WeakMap();
const JWT = new WeakMap();

/**
 * Authentication Service
 *
 * @author C Killua
 * @module Konko/Client/Authentication/Services/Authentication
 */
export default class AuthenticationService {

  /**
   * Constructor of AuthenticationService
   *
   * @param $http - service in module ng
   * @param $window - service in module ng
   * @param $rootScope - service in module ng
   * @param $state - service in module ui.router.state
   * @param $timeout - service in module ngMock
   * @param jwtHelper - angular-jwt
   * @constructs
   */
  /*@ngInject;*/
  constructor($http, $window, $rootScope, $state, $timeout, jwtHelper) {
    // set locals const
    HTTP.set(this, $http);
    STATE.set(this, $state);
    WINDOW.set(this, $window);
    ROOTSCOPE.set(this, $rootScope);
    JWT.set(this, jwtHelper);
  }

  /**
   * Stores the jwt into local storage
   *
   * @param {String} token - JsonWebToken
   * @param {callback} callback - A callback to run.
   * @returns
   */
  saveToken(token, callback) {
    HTTP.get(this).defaults.headers.common.Authorization = 'Bearer ' + token;
    WINDOW.get(this).localStorage['konko-token'] = token;
    ROOTSCOPE.get(this).$broadcast('token_saved');
    if (callback) {
      callback(token);
    }
  }

  /**
   * Remove the jwt from local storage
   *
   */
  deleteToken() {
    WINDOW.get(this).localStorage.removeItem('konko-token');
  }

  /**
   * Gets the jwt from local storage
   *
   * @returns {String} jwt
   */
  getToken() {
    return WINDOW.get(this).localStorage['konko-token'];
  }

  /**
   * Sync user's jwt from server
   *
   */
  syncToken() {
    HTTP.get(this)({
      method: 'GET',
      url: '/api/v1/auth/sync',
    }).then(data => {
      this.saveToken(data.data.token);
    });
  }

  /**
   * Simply decodes the jwt
   *
   * @param {String} token - jwt
   * @returns {Object} decoded jwt or null if no token provided
   */
  decodeToken(token) {
    return token ? JWT.get(this).decodeToken(token) : null;
  }

  /**
   * Checks the jwt if it's expired
   *
   * @returns {Boolean} true if jwt is expired, false otherwise
   */
  isExpired() {
    let token = this.getToken();
    return !token || JWT.get(this).isTokenExpired(token);
  }

  /**
   * Checks if the user is logged in
   *
   * @returns {Boolean} true if User is logged in, false otherwise
   */
  isLoggedIn() {
    return !this.isExpired() && this.getUserPermission() !== 'guest';
  }

  /**
   * Checks if user is an Admin
   *
   * @returns {Boolean} true if User is Admin, false otherwise
   */
  isAdmin() {
    return this.getUserPermission() === 'admin';
  }

  /**
   * Checks if user is an User
   *
   * @returns {Boolean} true if User is normal User, false otherwise
   */
  isUser() {
    return this.getUserPermission() === 'user';
  }

  /**
   * Checks if user is Banned
   *
   * @returns {Boolean} true if User is Banned, false otherwise
   */
  isBanned() {
    return this.getUserPermission() === 'banned';
  }

  /**
   * Checks if Guest
   *
   * @returns {Boolean} true if Guest, false otherwise
   */
  isGuest() {
    return this.getUserPermission() === 'guest';
  }

  /**
   * Checks if user is verified
   *
   * @returns {Boolean} true if verified, false otherwise
   */
  isVerified() {
    return this.currentUser() ? this.currentUser().verified : false;
  }

  /**
   * Returns the User information in Object
   *
   * @returns {Object} User object decoded from jwt
   */
  currentUser() {
    return this.decodeToken(this.getToken());
  }

  /**
   * Gets user's permission
   *
   * @returns {String} permission of current user, or none if there is no user
   */
  getUserPermission() {
    return this.currentUser() ? this.currentUser().permission : 'none';
  }

  /**
   * Gets user's preference settings
   *
   * @returns {Object} preference of current user, or null if there is no user
   */
  getUserPreference() {
    return this.currentUser() ? this.currentUser().preference : null;
  }

  /**
   * Sends register request to server
   *
   * @param {Object} user - New user infomation
   * @returns {Promise} promise from the server's response
   */
  register(user) {
    return HTTP.get(this).post('/api/v1/auth/register', user);
  }

  /**
   * Sends login request to server
   *
   * @param {Object} user - user information
   * @param {Boolean} isAdmin - if it's an admin login
   * @returns {Promise} promise from the server's response
   */
  login(user, isAdmin = false) {
    return isAdmin ? HTTP.get(this).post('/api/v1/auth/login?admin=1', user) : HTTP.get(this).post('/api/v1/auth/login', user);
  }

  /**
   * Sends password reset request to server
   *
   * @param {Object} data - data required by the request
   * @returns {Promise} promise from the server's response
   */
  reset(data) {
    return HTTP.get(this).post('/api/v1/auth/reset', data);
  }

  /**
   * Sends password confirm request to server
   *
   * @param {Object} data - data required by the request
   * @returns {Promise} promise from the server's response
   */
  checkPass(data) {
    return HTTP.get(this).post('/api/v1/auth/confirm', data);
  }

  /**
   * Sends logout request to server
   *
   * @returns {Promise} promise from the server's response
   */
  logout() {
    WINDOW.get(this).localStorage.removeItem('konko-token');
    HTTP.get(this).defaults.headers.common.Authorization = '';
    return HTTP.get(this).get('/api/v1/auth/logout');
  }

  /**
   * Gets a guest account from server
   *
   * @param {Object} toState -information of the state that going to
   * @param {Object} toParams - parameters of the state that going to
   */
  getGuest(toState, toParams) {
    this.logout().then(data => {
      this.saveToken(data.data.token, (token) => {
        ROOTSCOPE.get(this).$broadcast('update_auth');
        STATE.get(this).go(toState.name, toParams, { reload: true });
      });
    }).catch(err => STATE.get(this).go('error', {
      status: err.status,
      title: err.statusText,
      message: err.data,
    }, { reload: true }));
  }
}

/**
 * Callback that calls the callback fucntion.
 *
 * @callback callback
 * @param {String} token - JWT.
 */
