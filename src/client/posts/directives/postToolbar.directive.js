'use strict';

/**
 * Post toolbar directive
 *
 * @author C Killua
 * @module Konko/Client/Posts/Directives/PostToolbar
 * @returns {Object} Directive of konko-post-toolbar
 */
export default () => {
  return {
    restrict: 'AE',
    replace: true,
    transclude: true,
    templateUrl: 'styles/core/views/posts/toolbar.template.html',
    scope: {
      doc: '=',
    },
    controller: ($scope) => {
      'ngInject';
      $scope.vm = $scope.$parent.vm;
    },
  };
};
