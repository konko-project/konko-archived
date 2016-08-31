'use strict';

/**
 * Tooltip directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Tooltip
 * @param $timeout - service in ng
 * @returns {Object} Directive of konko-tooltip
 */
export default ($timeout) => {
  'ngInject';
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      attrs.$observe('title', v => {
        element.tooltip('dispose');
        element.tooltip();
      });
    },
  };
};
