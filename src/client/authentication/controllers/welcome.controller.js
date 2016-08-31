'use strict';

/**
 * Welcome page Controller
 *
 * @author C Killua
 * @module Konko/Client/Authentication/Controllers/Welcome
 */
export default class WelcomeController {

  /**
   * Constructor of WelcomeController
   *
   * @param $scope - type in module ng
   * @param $state - service in module ui.router.state
   * @param $timeout - service in module ngMock
   * @param $interval - service in module ngMock
   * @param AuthenticationService - service in module konko.authentication
   * @constructs
   */
  /*@ngInject;*/
  constructor($scope, $state, $timeout, $interval, AuthenticationService) {
    // other vars
    this.user = AuthenticationService.currentUser();
    $scope.countdown = 15;

    // set listener
    $timeout(() => {
      let promise = $interval(() => {
        $scope.countdown--;
      }, 1000);
      $scope.$watch('countdown', (_new, old) => {
        if (_new === 0) {
          $interval.cancel(promise);
          $state.go($state.previous.state.name, $state.previous.params, { reload: true });
        }
      });
    });
  }
}
