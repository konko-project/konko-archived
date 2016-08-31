'use strict';

const AUTH = new WeakMap();
const STATE = new WeakMap();

/**
 * Login Controller
 *
 * @author C Killua
 * @module Konko/Client/Authentication/Controllers/Login
 */
export default class LoginController {

  /**
   * Constructor of LoginController
   *
   * @param $state - service in module ui.router.state
   * @param $rootScope - service in module ng
   * @param AuthenticationService - service in module konko.authentication
   * @constructs
   */
  /*@ngInject;*/
  constructor($state, $rootScope, AuthenticationService) {
    // set locals const
    AUTH.set(this, AuthenticationService);
    STATE.set(this, $state);

    // other vars
    this.user = {};
    this.alert = null;

    // update html title
    $rootScope.$broadcast('title_update', 'Login');
  }

  /**
   * Logs an user in.
   *
   * @param {Boolean} isValid - Form validation
   */
  login(isValid) {
    if (!isValid) {
      return false;
    }

    AUTH.get(this).login(this.user).then(data => {
      this.alert = null;
      AUTH.get(this).saveToken(data.data.token);
      STATE.get(this).go(STATE.get(this).previous.state.name, STATE.get(this).previous.params, { reload: true });
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }
}
