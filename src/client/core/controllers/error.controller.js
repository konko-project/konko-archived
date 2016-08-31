'use strict';

/**
 * Error Controller
 *
 * @author C Killua
 * @module Konko/Client/Core/Controllers/Error
 */
export default class ErrorController {

  /**
   * Constructor of ErrorController
   *
   * @param $rootScope - service in module ng
   * @param $stateParams - service in module ui.router.state
   * @constructs
   */
  /*@ngInject;*/
  constructor($rootScope, $stateParams) {
    // docs
    this.error = $stateParams;
    this.error.message = this.error.message instanceof Object ?
      `<p class="lead">${this.error.message.message}</p>` : this.error.message;

    // update html title
    $rootScope.$broadcast('title_update', this.error.status);
  }

}
