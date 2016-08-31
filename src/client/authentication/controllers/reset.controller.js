'use strict';

const AUTH = new WeakMap();
const STATE = new WeakMap();

/**
 * Password Reset Controller
 *
 * @author C Killua
 * @module Konko/Client/Authentication/Controllers/Reset
 */
export default class ResetPasswordController {

  /**
   * Constructor of ResetPasswordController
   *
   * @param $state - service in module ui.router.state
   * @param $stateParams - service in module ui.router.state
   * @param AuthenticationService - service in module konko.authentication
   * @constructs
   */
  /*@ngInject;*/
  constructor($state, $stateParams, AuthenticationService) {
    // locals
    AUTH.set(this, AuthenticationService);
    STATE.set(this, $state);

    // other vars
    this.buttonMsg = 'Get verification code';
    this.data = {
      email: null,
      code: null,
      pass: null,
      pass2: null,
    };
    this.alert = null;
    this.hasCode = false;
    this.verified = false;
    this.corePassCfg = '';

    if ($stateParams.token) {
      this.hasCode = true;
      this.data.code = $stateParams.token;
      this.verify(true);
    }
  }

  /**
   * Get verfication code from server
   *
   * @param {Boolean} isValid - Form validation
   */
  getVerificationCode(isValid) {
    if (!isValid) {
      return false;
    }

    AUTH.get(this).reset(this.data).then(data => {
      this.hasCode = true;
      this.alert = { type: 'success', message: `An email with verification code has send to <b>${this.data.email}</b>` };
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Verfy verification code with server
   *
   * @param {Boolean} isValid - Form validation
   */
  verify(isValid) {
    if (!isValid) {
      return false;
    }

    AUTH.get(this).reset(this.data).then(data => {
      this.alert = { type: 'success', message: 'Email has been verified, please enter your new password' };
      this.verified = true;
      this.corePassCfg = data.data.passCfg;
      this.data.email = data.data.email;
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Reset user's password
   *
   * @param {Boolean} isValid - Form validation
   */
  reset(isValid) {
    if (!isValid) {
      return false;
    }
    AUTH.get(this).reset(this.data).then(data => {
      STATE.get(this).go('reset.success', {}, { reload: true });
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

}
