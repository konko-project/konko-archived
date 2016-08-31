'use strict';

/**
 * Alert directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Alert
 * @param $timeout - service in module ng
 * @returns {Object} Directive of konko-alert
 */
export default ($timeout) => {
  'ngInject';
  return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'styles/core/views/layout/alert.view.html',
      scope: {
        alert: '=',
      },
      link: (scope, element, attrs) => {
        $timeout(() => {
          scope.$watch('alert', val => {
            scope.alerts = val.message instanceof Array ?
              val.message.map(msg => ({ type: val.type, message: msg })) :
              [{ type: val.type, message: val.message }];
          }, true);
        });
      },
  };
};
