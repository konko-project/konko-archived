'use strict';

/**
 * At bottom directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/AtBottom
 * @param $window - service in module ng
 * @param $document - service in module ng
 * @param $rootScope - service in module ng
 * @returns {Object} Directive of at-bottom
 */
export default ($window, $document, $rootScope) => {
  'ngInject';
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      const checkAtBottom = () => {
        if ($window.innerHeight + $window.scrollY >= $document.height()) {
          if (!scope._willBeDestroyed) {
            $rootScope.$broadcast('at_bottom');
          }
        }
      };

      const throttled = _.throttle(checkAtBottom, 10, { trailing: true });
      $document.scroll(throttled);
    },
  };
};
