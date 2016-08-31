'use strict';

const APPNAME = 'konko';

angular.module(APPNAME, [
      'angular-jwt',
      'angular-loading-bar',
      'ngAnimate',
      'ngResource',
      'ngSanitize',
      'ui.router',
  ])
  .constant('_', window._)
  .config(['$provide', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$uiViewScrollProvider', 'cfpLoadingBarProvider', ($provide, $urlRouterProvider, $locationProvider, $httpProvider, $uiViewScrollProvider, cfpLoadingBarProvider) => {
    let {
      common,
    } = $httpProvider.defaults.headers;

    // Enable HTML5
    $locationProvider.html5Mode(true).hashPrefix('!');

    // Turn off cache
    common['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    common['Cache-Control'] = 'no-cache';
    common.Pragma = 'no-cache';

    // Anchor scroll
    $uiViewScrollProvider.useAnchorScroll();

    // Turn off loading spinner
    cfpLoadingBarProvider.includeSpinner = false;

    // redirect to index for invalid route
    $urlRouterProvider.otherwise('/');
  }])
  .run(['$window', '$http', '$rootScope', '$state', '$timeout', '$location', '$anchorScroll', 'AuthenticationService', 'CoreService', ($window, $http, $rootScope, $state, $timeout, $location, $anchorScroll, AuthenticationService, CoreService) => {
    $rootScope._ = $window._;
    $anchorScroll.yOffset = 56;

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
      angular.element('.collapse').collapse('hide');  // collapse collapse
      angular.element('.tooltip').tooltip('hide');

      // Adding JWT to header
      $http.defaults.headers.common.Authorization = 'Bearer ' + AuthenticationService.getToken();

      if (toState.name === 'setup.view') {
        // Remove Konko token when it's a setup page
        AuthenticationService.deleteToken();
      } else if (AuthenticationService.isExpired()) {
        // Get guest account if JWT is expired
        event.preventDefault();
        AuthenticationService.getGuest(toState, toParams);
        return false;
      } else if (AuthenticationService.isLoggedIn() && !(fromState.data && fromState.data.nosync)) {
        // sync user token if it's logged in
        AuthenticationService.syncToken();
      }

      // Route to maintenance page if site is close
      if (toState.name !== 'setup.view') {
        CoreService.get().$promise.then(({ basic }) => {
          $rootScope.$broadcast('state_change');
          if (!basic.public && !AuthenticationService.isAdmin() && toState.name !== 'maintenance') {
            event.preventDefault();
            $state.go('maintenance', { title: basic.title }, { reload: true });
          }
        });
      }
    });

    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
      // scroll to hash
      $timeout(() =>{
        if ($location.hash()) {
          $anchorScroll();
        }
      });

      // persisting state info if needed
      if (fromState.name) { // make sure it has a valid reference
        if (!fromState.data || !fromState.data.ignore) { // persist previous state if not ignore
          $window.localStorage.previous = JSON.stringify({
            state: fromState,
            params: fromParams
          });
        }
      }

      $state.previous = $window.localStorage.previous ? JSON.parse($window.localStorage.previous) : { state: { name: 'home.index' }, params: {} };
    });

    $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
      event.preventDefault();
      $state.go('error', {
        status: error.status,
        title: error.statusText,
        message: error.data,
      });
    });

    // Aligning csrf
    $http.defaults.xsrfCookieName = 'csrfToken';
  }]);

export default APPNAME;
