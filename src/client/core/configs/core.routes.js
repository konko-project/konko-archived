'use strict';

/**
 * Returns a new Core service
 *
 * @param CoreService - service in module konko.core
 * @returns {Object} new core service
 */
const newCore = CoreService => {
  'ngInject';
  return new CoreService();
};

/**
 * Return a promise of a core
 *
 * @param CoreService - service in module konko.core
 * @returns {Promise} Core promise
 */
const resolveCoreBasic = CoreService => {
  'ngInject';
  return CoreService.get({ fields: 'basic' }).$promise;
};

/**
 * Core routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Core/Configurations/Core
 */
export default $stateProvider => {
  'ngInject';
  $stateProvider.state('setup', {
    abstract: true,
    url: '/setup',
    template: '<ui-view/>',
    data: {
      ignore: true,
      nosync: true,
    },
  }).state('setup.view', {
    url: '',
    controller: 'SetupController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/core/setup.view.html',
    resolve: {
      core: newCore,
    },
    data: {
      ignore: true,
      nosync: true,
    },
  }).state('error', {
    url: '/error',
    controller: 'ErrorController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/core/error.view.html',
    params: {
      status: undefined,
      title: undefined,
      message: undefined,
    },
    data: {
      ignore: true,
      nosync: true,
    },
    onEnter: ($state, $stateParams) => {
      if (!$stateParams.status || $stateParams.status === 2333) {
        $state.go('home.index');
      }
    },
  }).state('maintenance', {
    url: '/maintenance',
    templateUrl: 'styles/core/views/core/maintenance.view.html',
    controller: ($scope, $rootScope, $stateParams, $state, AuthenticationService) => {
      $scope.title = $stateParams.title;
      $rootScope.$broadcast('title_update', 'ZZZzzz...');
      $scope.login = () => {
        let user = {
          email: $scope.adminEmail,
          password: $scope.adminPass,
        };
        AuthenticationService.login(user, true).then(data => {
          $scope.alert = null;
          AuthenticationService.saveToken(data.data.token);
          angular.element('#adminLogin').modal('hide');
          angular.element('#adminLogin').on('hidden.bs.modal', e => {
            $state.go('home.index', {}, { reload: true });
          });
        }).catch(err => $scope.alert = { type: 'danger', message: err.data.message });
      };
    },
    params: {
      title: undefined,
    },
    data: {
      ignore: true,
      nosync: true,
    },
    onEnter: ($state, $stateParams) => {
      if (!$stateParams.title) {
        $state.go('home.index');
      }
    },
  }).state('terms', {
    url: '/terms',
    resolve: {
      coreBasic: resolveCoreBasic,
    },
    controller: ($scope, $rootScope, coreBasic) => {
      $scope.title = coreBasic.basic.title;
			$rootScope.$broadcast('title_update', 'Terms');
    },
    templateUrl: 'styles/core/views/core/terms.view.html',
  }).state('privacy', {
    url: '/privacy',
		controller: ($rootScope) => {			
			$rootScope.$broadcast('title_update', 'Privacy');
		},
    templateUrl: 'styles/core/views/core/privacy.view.html',
  });
};
