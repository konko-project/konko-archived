'use strict';

const AUTH = new WeakMap();
const STATE = new WeakMap();

/**
 * Setup Controller
 *
 * @author C Killua
 * @module Konko/Client/Core/Controllers/Setup
 */
export default class SetupController {

  /**
   * Constructor of SetupController
   *
   * @param $state - service in module ui.router.state
   * @param {Object} core - new core service
   * @param AuthenticationService - service in module konko.authentication
   * @param CoreService - service in module konko.core
   * @constructs
   */
  /*@ngInject;*/
  constructor($state, core, AuthenticationService, CoreService) {
    // docs
    this.core = core;

    // other vars
    this.alert = null;
    this.admin = {};
    this.passRegExp = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\@\\#\\$\\%\\^\\&\\*\\_\\ ]).{8,32}';
    this.passRegExpTitle = 'Must contains 8 to 32 characters, including at least 1 digit, 1 lower case letter, 1 upper case letter, and 1 of the following special characters. (!, @, #, $, %, ^, &, *, _, )';

    // set locals const
    AUTH.set(this, AuthenticationService);
    STATE.set(this, $state);
  }

  /**
   * Save the new Core
   *
   * @param {Boolean} isValid - Form validation
   */
  save(isValid) {
    if (!isValid) {
      return false;
    } else {
      this.core.admin = { email: this.admin.email };
      this.core.$save().then(data => {
        this.alert = null;
        this.admin.core = data._id;
        AUTH.get(this).register(this.admin).then(data => {
          AUTH.get(this).saveToken(data.data.token, token => location.reload());
        }).catch(err => this.alert = { type: 'danger', message: err.data.message });
      }).catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

}
