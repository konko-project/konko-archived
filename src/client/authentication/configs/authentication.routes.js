'use strict';

/**
 * Returns the promise of Core
 *
 * @param $state - service in module ui.router.state
 * @param CoreService - service in module konko.core
 * @returns {Promise} Core promise
 */
const resolveCore = ($state, CoreService) => {
  'ngInject';
  return CoreService.get({fields: 'basic,registration'}).$promise;
};

/**
 * Authentication routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Authentication/Configurations/Authentication
 */
export default $stateProvider => {
  'ngInject';
  $stateProvider.state('register', {
    url: '/register',
    controller: 'RegisterController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/auth/register.view.html',
    data: {
      ignore: true,
    },
    resolve: {
      core: resolveCore,
    },
    onEnter: (core, $state, AuthenticationService) => {
      if (!core.registration.public) {
        $state.go('error', {
          status: '2333',
          title: 'Registration is temporary closed!',
          message: core.registration.message,
        }, { reload: true });
      } else if (AuthenticationService.isLoggedIn()) {
        $state.go('home.index');
      }
    },
  }).state('login', {
    url: '/login',
    controller: 'LoginController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/auth/login.view.html',
    data: {
      ignore: true,
    },
    onEnter: ($state, AuthenticationService) => {
      if (AuthenticationService.isLoggedIn()) {
        $state.go('home.index');
      }
    },
  }).state('welcome', {
    url: '/welcome',
    controller: 'WelcomeController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/auth/welcome.view.html',
    data: {
      ignore: true,
    },
    onEnter: ($state, AuthenticationService) => {
      if (AuthenticationService.currentUser().verified || AuthenticationService.getUserPermission() === 'guest') {
        $state.go('home.index');
      }
    },
  }).state('verify', {
    url: '/verify/:token',
    templateUrl: 'styles/core/views/auth/verify.view.html',
    controller: ($http, $scope, $state, $stateParams) => {
      $http({ method: 'GET', url: '/api/v1/verify/' + $stateParams.token }).then(data => {
        $scope.title = 'Account Verified';
        $scope.message = 'Your account has been verified. Now you can do more stuff with your account.';
      }).catch(err => {
        $state.go('error', {
          status: err.status,
          title: err.statusText,
          message: err.data,
        }, { reload: true });
      });
    },
    data: {
      ignore: true,
    },
  }).state('reset', {
    url: '/reset',
    abstract: true,
    template: '<ui-view/>',
  }).state('reset.success', {
    url: '/success',
    templateUrl: 'styles/core/views/auth/reset.success.html',
    data:{
      ignore: true,
    },
  }).state('reset.form', {
    url: '/:token',
    controller: 'ResetPasswordController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/auth/reset.view.html',
    data:{
      ignore: true,
    },
  });
};
