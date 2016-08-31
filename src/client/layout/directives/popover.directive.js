'use strict';

/**
 * Popover directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Popover
 * @param $timeout - service in ng
 * @returns {Object} Directive of popover
 */
export default ($timeout) => {
  'ngInject';
  return {
    restrict: 'A',
    link: (scope, element) => $timeout(() => element.popover()),
  };
};
