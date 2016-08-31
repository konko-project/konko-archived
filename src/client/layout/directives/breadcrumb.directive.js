'use strict';

/**
 * Breadcrumb directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Breadcrumb
 * @param $state - service in module ui.router.state
 * @param $rootScope - service in module ng
 * @returns {Object} Directive of breadcrumb
 */
export default ($state, $rootScope) => {
  'ngInject';
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'styles/core/views/layout/breadcrumb.view.html',
    scope: {
      parentName: '@',
      parentState: '@',
      parentParams: '@',
      currentName: '@',
    },
    link: (scope, element, attrs) => {
      let state = $state.current;
      scope.breadcrumbs = [{ name: 'Home', sref: 'home.index', params: {} }];
      if (scope.parentName) {
        let params = JSON.parse(scope.parentParams);
        scope.breadcrumbs.push({ name: scope.parentName, sref: scope.parentState, params: params });
      }

      if (scope.currentName) {
        scope.breadcrumbs.push({ name: scope.currentName, sref: state.name, params: state.params });
      }

      $rootScope.$broadcast('title_update', scope.currentName || 'Home');
    },
  };
};
