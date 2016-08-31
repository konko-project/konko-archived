'use strict';

const CORE = new WeakMap();
const AUTH = new WeakMap();
const STATE = new WeakMap();
const ROOTSCOPE = new WeakMap();

let {
  element,
} = angular;

/**
 * Navbar Controller
 *
 * @author C Killua
 * @module Konko/Client/Layout/Controllers/Navbar
 */
export default class NavbarController {

  /**
   * Constructor of NavbarController
   *
   * @param $rootScope - service in module ng
   * @param $scope - type in module ng
   * @param $timeout - service in module ng
   * @param $state - service in module ui.router.state
   * @param AuthenticationService - service in module konko.authentication
   * @param CoreService - service in module konko.core
   * @constructs
   */
  /*@ngInject;*/
  constructor($rootScope, $scope, $timeout, $state, AuthenticationService, CoreService) {
    // set locals const
    CORE.set(this, CoreService);
    AUTH.set(this, AuthenticationService);
    STATE.set(this, $state);
    ROOTSCOPE.set(this, $rootScope);

    // other vars
    this.core = {};
    this.navs = [];
    this.isLoggedIn = AUTH.get(this).isLoggedIn();
    this.user = AUTH.get(this).currentUser();
    this.adminLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNTEycHgiIHdpZHRoPSI1MTJweCI+IAkJPHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIxODBweCIgc3R5bGU9ImZvbnQtZmFtaWx5OiBBcmlhbCBCbGFjazsgZm9udC1zaXplOiA1MTJweDsgZmlsbDogIzk5OTsiICB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4mIzk4ODE7PC90ZXh0PiAgCTwvc3ZnPg==';

    // set handler
    $timeout(() => {
      this.updateCore();
      _.map(['update_auth', 'token_saved'], e => $scope.$on(e, event => {
        this.isLoggedIn = AUTH.get(this).isLoggedIn();
        this.user = AUTH.get(this).currentUser();
      }));
      _.map(['core_updated', 'update_auth', 'state_change'], e => $scope.$on(e, event => {
        this.updateCore();
      }));
      element('#navbar-header').on('show.bs.collapse', () => $rootScope.$broadcast('nav_expanding'));
    });
  }

  /**
   * Checks if user is an Admin
   *
   * @returns {Boolean} true if Admin, false otherwise
   */
  isAdmin() {
    return this.user.permission === 'admin';
  }

  /**
   * Log out an user
   *
   */
  logout() {
    AUTH.get(this).logout().then(data => {
      AUTH.get(this).saveToken(data.data.token, (token) => {
        ROOTSCOPE.get(this).$broadcast('update_auth');
        STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
      });
    });
  }

  /**
   * Updates core info from server
   *
   */
  updateCore() {
    if (AUTH.get(this).isExpired()) {
      return false;
    }
    this.resolveCore().then(data => {
      this.core = data;
      this.navs = this.core.global.navbar.navs;
      element('.logo').attr('src', this.core.basic.logo);
      ROOTSCOPE.get(this).$broadcast('title_update', null, this.core.basic.title);
    });
  }

  /**
   * Sends request to get a Core
   *
   * @returns {promise} core promise
   */
  resolveCore() {
    return CORE.get(this).get({ fields: 'basic,global'}).$promise;
  }

}
