'use strict';

const AUTH = new WeakMap();
const STATE = new WeakMap();

/**
 * Registration Controller
 *
 * @author C Killua
 * @module Konko/Client/Authentication/Controllers/Register
 */
export default class RegisterController {

  /**
   * Constructor of RegisterController
   *
   * @param {Object} core - resolved core
   * @param $state - service in module ui.router.state
   * @param AuthenticationService - service in module konko.authentication
   * @constructs
   */
  /*@ngInject;*/
  constructor(core, $state, AuthenticationService) {
    // set locals const
    AUTH.set(this, AuthenticationService);
    STATE.set(this, $state);

    // docs
    this.core = core;

    // other vars
    this.user = {};
    this.alert = null;
  }

  /**
   * Register a new user in
   *
   * @param {Boolean} isValid - Form validation
   */
  register(isValid) {
    if (!isValid || this.user.password !== this.user.password2) {
      return false;
    }

    AUTH.get(this).register(this.user).then(data => {
      AUTH.get(this).saveToken(data.data.token, token => STATE.get(this).go('welcome', null, { reload: true }));
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }
}
